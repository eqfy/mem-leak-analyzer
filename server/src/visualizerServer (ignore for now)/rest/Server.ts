import * as http from "http";
import { readFileSync } from "fs";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";

export default class Server {
  private readonly port: number;
  private express: Application;
  private server: http.Server | undefined;

  constructor(port: number) {
    console.info(`Server::<init>( ${port} )`);
    this.port = port;
    this.express = express();

    this.registerMiddleware();
    this.registerRoutes();

    this.express.use(express.static(path.join(__dirname, "../../../../client/out")));
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server !== undefined) {
        console.error("Server already listening");
        reject();
      } else {
        this.server = this.express
          .listen(this.port, () => {
            console.info(`Server listening on port: ${this.port}`);
            resolve();
          })
          .on("error", (err: Error) => {
            console.error(`Server start() ERROR: ${err.message}`);
            reject(err);
          });
      }
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server === undefined) {
        console.error("Server not started");
        reject();
      } else {
        this.server.close(() => {
          console.info("Server closed");
          resolve();
        });
      }
    });
  }

  private getVisualizerOutput(req: Request, res: Response) {
    try {
      console.debug('getVisualizerOutput');
      const content = readFileSync(path.join(__dirname, "../../test.c")).toString();
      res.status(200).json({  result: "test" });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  private registerMiddleware() {
    this.express.use(express.json());
    this.express.use(express.raw({ type: "application/*", limit: "10mb" }));
    this.express.use(cors());
  }

  private registerRoutes() {
    this.express.get("/tree", this.getVisualizerOutput);
  }
}
