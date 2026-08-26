-- CreateEnum
CREATE TYPE "TranslatableEntity" AS ENUM ('PRODUCT', 'CATEGORY');

-- CreateEnum
CREATE TYPE "TranslatableField" AS ENUM ('NAME', 'DESCRIPTION');

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "entityType" "TranslatableEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "field" "TranslatableField" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Translation_entityType_entityId_locale_idx" ON "Translation"("entityType", "entityId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_entityType_entityId_locale_field_key" ON "Translation"("entityType", "entityId", "locale", "field");
