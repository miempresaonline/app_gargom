import { prisma } from '@/lib/db';
import CertificacionesClient from './client';

export const dynamic = 'force-dynamic';

export default async function CertificacionesPage() {
  const [certificaciones, obras] = await Promise.all([
    prisma.certification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: true
      }
    }),
    prisma.project.findMany({ orderBy: { direccion: 'asc' } })
  ]);

  // Calculate next certification/invoice number
  let maxNum = 0;
  let prefix = 'CERT-';
  for (const cert of certificaciones) {
    const match = cert.numero.match(/^(.*?)(\d+)$/);
    if (match) {
      const currentPrefix = match[1];
      const currentNum = parseInt(match[2], 10);
      if (currentNum > maxNum) {
        maxNum = currentNum;
        prefix = currentPrefix;
      }
    }
  }
  const nextCertNumber = maxNum === 0 ? 'CERT-1' : `${prefix}${maxNum + 1}`;

  return (
    <CertificacionesClient 
      initialCertificaciones={certificaciones} 
      obras={obras} 
      nextCertNumber={nextCertNumber}
    />
  );
}
