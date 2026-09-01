-- CreateEnum
CREATE TYPE "TipoConta" AS ENUM ('PF', 'PJ');

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "cpfCliente" TEXT;
UPDATE "Reserva" SET "cpfCliente" = '00000000000' WHERE "cpfCliente" IS NULL;
ALTER TABLE "Reserva" ALTER COLUMN "cpfCliente" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "doisFatoresAtivo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "doisFatoresCodigosBackup" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "doisFatoresSecret" TEXT,
ADD COLUMN     "doisFatoresSecretPendente" TEXT,
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "telefoneVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipoConta" "TipoConta" NOT NULL DEFAULT 'PF';

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificacaoTelefone" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "telefone" TEXT NOT NULL,
    "codigoHash" TEXT NOT NULL,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificacaoTelefone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "VerificacaoTelefone_userId_idx" ON "VerificacaoTelefone"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificacaoTelefone" ADD CONSTRAINT "VerificacaoTelefone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

