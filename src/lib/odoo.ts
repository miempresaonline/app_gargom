import { prisma } from './db';
import { logAction } from './logger';

const ODOO_URL = process.env.ODOO_URL || 'https://odoo.construccionesgargom.es';
const ODOO_DB = process.env.ODOO_DB || 'odoo-gargom-db';
const ODOO_USERNAME = process.env.ODOO_USERNAME || 'daniel@miempresa.online';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '26a942304a35ea87cad72d831e20e7fd911fb8ee';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function valToXml(val: any): string {
  if (typeof val === 'string') {
    return `<value><string>${escapeXml(val)}</string></value>`;
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return `<value><int>${val}</int></value>`;
    }
    return `<value><double>${val}</double></value>`;
  }
  if (typeof val === 'boolean') {
    return `<value><boolean>${val ? '1' : '0'}</boolean></value>`;
  }
  if (Array.isArray(val)) {
    const items = val.map(item => valToXml(item)).join('');
    return `<value><array><data>${items}</data></array></value>`;
  }
  if (typeof val === 'object' && val !== null) {
    const members = Object.entries(val).map(([key, value]) => {
      const valXml = valToXml(value);
      return `<member><name>${key}</name>${valXml}</member>`;
    }).join('');
    return `<value><struct>${members}</struct></value>`;
  }
  return '<value><nil/></value>';
}

function parseXmlRpcResponse(xmlString: string): any {
  if (xmlString.includes('<fault>')) {
    const faultCodeMatch = xmlString.match(/<name>faultCode<\/name>\s*<value>\s*<(?:int|i4)>([^<]+)<\/(?:int|i4)>/);
    const faultStringMatch = xmlString.match(/<name>faultString<\/name>\s*<value>\s*<string>([\s\S]*?)<\/string>/);
    const code = faultCodeMatch ? faultCodeMatch[1] : 'unknown';
    const msg = faultStringMatch ? faultStringMatch[1] : 'unknown error';
    throw new Error(`XML-RPC Fault: [${code}] ${msg}`);
  }

  const tokens: Array<{ type: 'tag' | 'text'; value: string }> = [];
  let pos = 0;
  while (pos < xmlString.length) {
    if (xmlString[pos] === '<') {
      const end = xmlString.indexOf('>', pos);
      if (end === -1) break;
      const tag = xmlString.substring(pos, end + 1);
      tokens.push({ type: 'tag', value: tag });
      pos = end + 1;
    } else {
      const nextLT = xmlString.indexOf('<', pos);
      const end = nextLT === -1 ? xmlString.length : nextLT;
      const text = xmlString.substring(pos, end).trim();
      if (text) {
        const decodedText = text
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"');
        tokens.push({ type: 'text', value: decodedText });
      }
      pos = end;
    }
  }

  function parseTag(tagStr: string) {
    const name = tagStr.replace(/[<\/>]/g, '').trim().split(' ')[0];
    return { name };
  }

  function parseValue(tokenList: any[]): any {
    let token = tokenList.shift();
    if (!token) return null;
    if (token.type === 'tag' && token.value.startsWith('<value')) {
      const result = parseInner(tokenList);
      tokenList.shift(); // consume </value>
      return result;
    }
    return null;
  }

  function parseInner(tokenList: any[]): any {
    let token = tokenList[0];
    if (!token) return null;
    if (token.type === 'tag') {
      const { name } = parseTag(token.value);
      if (name === 'struct') {
        tokenList.shift(); // consume <struct>
        const obj: any = {};
        while (tokenList[0] && parseTag(tokenList[0].value).name !== 'struct') {
          tokenList.shift(); // consume <member>
          tokenList.shift(); // consume <name>
          const nameToken = tokenList.shift();
          const memberName = nameToken ? nameToken.value : '';
          tokenList.shift(); // consume </name>
          const memberVal = parseValue(tokenList);
          tokenList.shift(); // consume </member>
          obj[memberName] = memberVal;
        }
        tokenList.shift(); // consume </struct>
        return obj;
      }
      if (name === 'array') {
        tokenList.shift(); // consume <array>
        tokenList.shift(); // consume <data>
        const arr = [];
        while (tokenList[0] && parseTag(tokenList[0].value).name !== 'data') {
          arr.push(parseValue(tokenList));
        }
        tokenList.shift(); // consume </data>
        tokenList.shift(); // consume </array>
        return arr;
      }
      if (name === 'int' || name === 'i4') {
        tokenList.shift(); // consume <int>
        const valToken = tokenList.shift();
        const val = valToken ? parseInt(valToken.value) : 0;
        tokenList.shift(); // consume </int>
        return val;
      }
      if (name === 'double') {
        tokenList.shift(); // consume <double>
        const valToken = tokenList.shift();
        const val = valToken ? parseFloat(valToken.value) : 0.0;
        tokenList.shift(); // consume </double>
        return val;
      }
      if (name === 'boolean') {
        tokenList.shift(); // consume <boolean>
        const valToken = tokenList.shift();
        const val = valToken ? (valToken.value === '1' || valToken.value.toLowerCase() === 'true') : false;
        tokenList.shift(); // consume </boolean>
        return val;
      }
      if (name === 'string') {
        tokenList.shift(); // consume <string>
        let val = '';
        if (tokenList[0] && tokenList[0].type === 'text') {
          val = tokenList.shift().value;
        }
        tokenList.shift(); // consume </string>
        return val;
      }
      if (name === 'nil') {
        tokenList.shift(); // consume <nil>
        return null;
      }
    }
    return null;
  }

  const valIdx = tokens.findIndex(t => t.type === 'tag' && t.value.startsWith('<value'));
  if (valIdx === -1) return null;
  const listToParse = tokens.slice(valIdx);
  return parseValue(listToParse);
}

async function callXmlRpc(url: string, service: string, method: string, params: any[]): Promise<any> {
  const xmlParams = params.map(p => `<param>${valToXml(p)}</param>`).join('');
  const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    ${xmlParams}
  </params>
</methodCall>`;

  const response = await fetch(`${url}/xmlrpc/2/${service}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body
  });

  if (!response.ok) {
    throw new Error(`HTTP Error calling Odoo XML-RPC: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return parseXmlRpcResponse(text);
}

async function getTaxId(uid: number, apiKey: string, percentage: number): Promise<number | null> {
  try {
    const taxes = await callXmlRpc(ODOO_URL, 'object', 'execute_kw', [
      ODOO_DB, uid, apiKey,
      'account.tax', 'search_read',
      [[['type_tax_use', '=', 'sale'], ['amount', '=', percentage]]],
      { fields: ['id'], limit: 1 }
    ]);
    if (taxes && taxes.length > 0) {
      return taxes[0].id;
    }
  } catch (e) {
    console.error('Failed to search tax in Odoo:', e);
  }
  // Fallbacks
  if (percentage === 21) return 1;
  if (percentage === 10) return 72;
  if (percentage === 4) return 71;
  return null;
}

export async function syncInvoiceToOdoo(certificationId: number): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch certification details
    const cert = await prisma.certification.findUnique({
      where: { id: certificationId },
      include: {
        project: {
          include: {
            clients: true
          }
        }
      }
    });

    if (!cert) {
      return { success: false, error: 'La certificación/factura no existe' };
    }

    const project = cert.project;
    if (!project) {
      return { success: false, error: 'La certificación no está vinculada a ninguna obra' };
    }

    // 2. Identify clients to bill
    const targetClients: Array<{ nombre: string; cif: string | null; direccion: string | null; porcentaje: number }> = [];

    if (project.clients && project.clients.length > 0) {
      project.clients.forEach(c => {
        targetClients.push({
          nombre: c.nombre,
          cif: c.cif,
          direccion: c.direccion,
          porcentaje: c.porcentajeFacturacion ?? 100
        });
      });
    } else {
      targetClients.push({
        nombre: project.cliente,
        cif: null,
        direccion: null,
        porcentaje: 100
      });
    }

    // 3. Connect and authenticate with Odoo
    console.log('Authenticating with Odoo...');
    const uid = await callXmlRpc(ODOO_URL, 'common', 'authenticate', [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}]);
    if (!uid || typeof uid !== 'number') {
      return { success: false, error: 'Fallo de autenticación en Odoo' };
    }

    // Find Odoo tax ID based on project percentageImpuesto
    const taxId = await getTaxId(uid, ODOO_API_KEY, project.porcentajeImpuesto);

    // 4. Iterate over clients and create draft invoices
    const odooInvoiceIds: number[] = [];

    for (const client of targetClients) {
      let partnerId: number | null = null;

      // 4a. Check if customer exists in Odoo
      if (client.cif) {
        const searchVat = await callXmlRpc(ODOO_URL, 'object', 'execute_kw', [
          ODOO_DB, uid, ODOO_API_KEY,
          'res.partner', 'search',
          [[['vat', '=', client.cif]]]
        ]);
        if (searchVat && searchVat.length > 0) {
          partnerId = searchVat[0];
        }
      }

      if (!partnerId) {
        const searchName = await callXmlRpc(ODOO_URL, 'object', 'execute_kw', [
          ODOO_DB, uid, ODOO_API_KEY,
          'res.partner', 'search',
          [[['name', '=', client.nombre]]]
        ]);
        if (searchName && searchName.length > 0) {
          partnerId = searchName[0];
        }
      }

      // 4b. Create customer if not found
      if (!partnerId) {
        console.log(`Creating customer partner "${client.nombre}" in Odoo...`);
        partnerId = await callXmlRpc(ODOO_URL, 'object', 'execute_kw', [
          ODOO_DB, uid, ODOO_API_KEY,
          'res.partner', 'create',
          [{
            name: client.nombre,
            vat: client.cif || '',
            street: client.direccion || '',
            is_company: true,
            customer_rank: 1
          }]
        ]);
        if (!partnerId || typeof partnerId !== 'number') {
          throw new Error(`Error al crear el cliente "${client.nombre}" en Odoo`);
        }
      }

      // 4c. Create draft customer invoice (account.move)
      console.log(`Creating draft invoice in Odoo for partner ID ${partnerId}...`);
      
      const invoiceDate = new Date().toISOString().split('T')[0];
      const clientAmount = cert.importe * (client.porcentaje / 100);
      
      const invoiceLineFields: any = {
        name: `${cert.concepto} (Obra: ${project.direccion})`,
        quantity: 1.0,
        price_unit: clientAmount,
        account_id: 500 // 'Services rendered' income account
      };

      if (taxId) {
        invoiceLineFields.tax_ids = [[6, 0, [taxId]]];
      }

    const invoiceId = await callXmlRpc(ODOO_URL, 'object', 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'account.move', 'create',
        [{
          move_type: 'out_invoice',
          partner_id: partnerId,
          invoice_date: invoiceDate,
          journal_id: 1, // Sales journal
          ref: targetClients.length > 1 ? `${cert.numero} - ${client.nombre}` : cert.numero,
          invoice_line_ids: [[0, 0, invoiceLineFields]]
        }]
      ]);

      if (!invoiceId || typeof invoiceId !== 'number') {
        throw new Error(`Error al crear la factura borrador en Odoo para el cliente ${client.nombre}`);
      }

      odooInvoiceIds.push(invoiceId);
    }

    // 5. Update certification state to sent in our local DB
    await prisma.certification.update({
      where: { id: certificationId },
      data: { enviadaOdoo: true }
    });

    console.log(`✅ Facturas creadas con éxito en Odoo. IDs: ${odooInvoiceIds.join(', ')}`);
    return { success: true };

  } catch (err: any) {
    console.error('Odoo sync flow error:', err);
    return { success: false, error: err.message || 'Error de conexión con Odoo' };
  }
}
