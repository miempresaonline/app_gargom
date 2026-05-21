import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const imagesDir = join(process.cwd(), 'public', 'imagenes');
    
    // Ensure directories exist
    await mkdir(imagesDir, { recursive: true });

    // Build unique name
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(imagesDir, filename);

    await writeFile(filePath, buffer);
    console.log(`Saved file to ${filePath}`);

    return NextResponse.json({ 
      success: true, 
      url: `/imagenes/${filename}` 
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error al guardar el archivo: ' + error.message }, { status: 500 });
  }
}
