-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('pendente', 'confirmada', 'recusada', 'cancelada');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Espaco" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "unidadePreco" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 0,
    "avaliacaoNota" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avaliacaoTotalAvaliacoes" INTEGER NOT NULL DEFAULT 0,
    "imagemCapa" TEXT,
    "galeria" JSONB NOT NULL DEFAULT '[]',
    "comodidades" JSONB NOT NULL DEFAULT '[]',
    "informacoes" JSONB NOT NULL DEFAULT '[]',
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Espaco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "espacoId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "horarioInicio" TEXT NOT NULL,
    "horarioFim" TEXT NOT NULL,
    "status" "StatusReserva" NOT NULL DEFAULT 'pendente',
    "nomeCliente" TEXT NOT NULL,
    "telefoneCliente" TEXT NOT NULL,
    "emailCliente" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Espaco_slug_key" ON "Espaco"("slug");

-- CreateIndex
CREATE INDEX "Espaco_tipo_idx" ON "Espaco"("tipo");

-- CreateIndex
CREATE INDEX "Reserva_espacoId_data_idx" ON "Reserva"("espacoId", "data");

-- CreateIndex
CREATE INDEX "Reserva_userId_idx" ON "Reserva"("userId");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "Espaco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
