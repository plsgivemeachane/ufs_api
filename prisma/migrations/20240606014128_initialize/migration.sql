-- CreateTable
CREATE TABLE "APIList" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "API_KEY" TEXT NOT NULL,
    "USER" TEXT NOT NULL,

    CONSTRAINT "APIList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_name" TEXT NOT NULL,
    "file_cids" TEXT[],
    "API_KEY" TEXT NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "APIList_API_KEY_key" ON "APIList"("API_KEY");

-- CreateIndex
CREATE UNIQUE INDEX "Storage_file_name_key" ON "Storage"("file_name");

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "public_Storage_API_KEY_fkey" FOREIGN KEY ("API_KEY") REFERENCES "APIList"("API_KEY") ON DELETE CASCADE ON UPDATE CASCADE;
