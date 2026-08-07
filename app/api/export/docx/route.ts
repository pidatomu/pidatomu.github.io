import { NextRequest } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";

interface ExportDocxBody {
  konten: string;
  tema: string;
  kategori: string;
  namaPenceramah?: string;
  namaLokasi?: string;
  tanggal?: string;
  provider?: string;
}

/** Pisahkan teks naskah menjadi array segment { type: heading|text, content } */
function parseSegments(raw: string) {
  return raw.split("\n").map((line) => {
    const m = line.match(/^\*\*([^*]+)\*\*\s*$/);
    return m
      ? { type: "heading" as const, content: m[1] }
      : { type: "text" as const, content: line };
  });
}

function buildDocx(body: ExportDocxBody): Document {
  const {
    konten,
    tema,
    kategori,
    namaPenceramah,
    namaLokasi,
    tanggal,
    provider,
  } = body;

  const segments = parseSegments(konten);

  // Bangun paragraf dokumen
  const children: Paragraph[] = [
    // Badge kategori
    new Paragraph({
      children: [
        new TextRun({
          text: kategori.toUpperCase(),
          bold: true,
          size: 18,
          color: "777777",
        }),
      ],
      spacing: { after: 80 },
    }),

    // Judul (tema)
    new Paragraph({
      text: tema,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),

    // Metadata baris
    ...(namaPenceramah || namaLokasi || tanggal
      ? [
          new Paragraph({
            children: [
              ...(namaPenceramah
                ? [
                    new TextRun({ text: "Penceramah: ", bold: true, size: 20 }),
                    new TextRun({ text: namaPenceramah + "  ", size: 20 }),
                  ]
                : []),
              ...(namaLokasi
                ? [
                    new TextRun({ text: "Lokasi: ", bold: true, size: 20 }),
                    new TextRun({ text: namaLokasi + "  ", size: 20 }),
                  ]
                : []),
              ...(tanggal
                ? [
                    new TextRun({ text: "Tanggal: ", bold: true, size: 20 }),
                    new TextRun({ text: tanggal, size: 20 }),
                  ]
                : []),
            ],
            spacing: { after: 80 },
          }),
        ]
      : []),

    // Garis pemisah
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
      },
      spacing: { after: 240 },
    }),

    // Naskah (parsing heading & paragraf)
    ...segments.map((seg) => {
      if (seg.type === "heading") {
        return new Paragraph({
          text: seg.content,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 100 },
        });
      }
      // Baris kosong → spacing extra
      if (!seg.content.trim()) {
        return new Paragraph({ spacing: { after: 80 } });
      }
      return new Paragraph({
        children: [new TextRun({ text: seg.content, size: 24 })],
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
      });
    }),
  ];

  return new Document({
    numbering: { config: [] },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PIDATOMU — MBS Tanggul",
                    size: 18,
                    color: "888888",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Dibuat dengan Pidatomu · ${provider === "groq" ? "Groq AI" : "Gemini AI"} · `,
                    size: 18,
                    color: "888888",
                  }),
                  new TextRun({
                    children: ["Halaman ", PageNumber.CURRENT, " dari ", PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: "888888",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        properties: {},
        children,
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: ExportDocxBody = await req.json();

    if (!body.konten || !body.tema) {
      return Response.json({ error: "konten dan tema wajib diisi" }, { status: 400 });
    }

    const doc = buildDocx(body);
    const buffer = await Packer.toBuffer(doc);

    const fileName = `pidato-${body.tema.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.docx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    console.error("[export/docx] error:", err);
    return Response.json({ error: "Gagal generate DOCX" }, { status: 500 });
  }
}
