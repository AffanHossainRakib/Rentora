import express, { Application, Request, Response } from "express";
import { prisma } from "./lib/prisma";
import app from "./app";

let dbInitialized = false;

const serverlessHandler = async (req: Request, res: Response) => {
  if (!dbInitialized) {
    await prisma.$connect();
    dbInitialized = true;
  }

  return app(req, res);
};

export default serverlessHandler;
