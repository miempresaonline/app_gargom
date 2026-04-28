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

  return <CertificacionesClient initialCertificaciones={certificaciones} obras={obras} />;
}
