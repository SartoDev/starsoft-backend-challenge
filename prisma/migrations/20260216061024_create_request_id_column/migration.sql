/*
  Warnings:

  - A unique constraint covering the columns `[requestId]` on the table `seat_reservations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestId` to the `seat_reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "seat_reservations" ADD COLUMN     "requestId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "seat_reservations_requestId_key" ON "seat_reservations"("requestId");
