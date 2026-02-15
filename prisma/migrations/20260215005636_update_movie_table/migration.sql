/*
  Warnings:

  - You are about to drop the column `name` on the `movie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `movie` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `genre` to the `movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseYear` to the `movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `movie` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "movie_name_key";

-- AlterTable
ALTER TABLE "movie" DROP COLUMN "name",
ADD COLUMN     "genre" TEXT NOT NULL,
ADD COLUMN     "releaseYear" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "movie_title_key" ON "movie"("title");
