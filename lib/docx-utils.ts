import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  PageBreak,
} from "docx";

export interface DocxOptions {
  title: string;
  content: string;
  author?: string;
}

export async function generateDocxBuffer(options: DocxOptions): Promise<Buffer> {
  const { title, content, author = "Generador de Documentos Legales" } = options;

  // Split content into paragraphs
  const paragraphs = content.split("\n").filter((p) => p.trim().length > 0);

  const docParagraphs: Paragraph[] = [];

  // Add title
  docParagraphs.push(
    new Paragraph({
      text: title,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
      },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 28,
          font: "Times New Roman",
        }),
      ],
    })
  );

  // Add content paragraphs
  paragraphs.forEach((para) => {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          line: 360, // 1.5 line spacing
          after: 200,
        },
        children: [
          new TextRun({
            text: para,
            size: 24, // 12pt
            font: "Times New Roman",
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
        },
        children: docParagraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 100);
}
