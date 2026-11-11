-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contatosWhatsapp" JSONB NOT NULL DEFAULT '[]';

-- Migra o numero ja cadastrado (campo antigo whatsappContato) para o
-- primeiro item da nova lista, preservando o que o proprietario ja
-- configurou.
UPDATE "User"
SET "contatosWhatsapp" = jsonb_build_array(
  jsonb_build_object('id', 'principal', 'nome', 'WhatsApp', 'numero', "whatsappContato")
)
WHERE "whatsappContato" IS NOT NULL AND "whatsappContato" != '';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "whatsappContato";
