import * as request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./../src/app.module";
import * as path from "path";
import * as fs from "fs";

describe("FilesController (e2e)", () => {
  let app: INestApplication;
  let server: any;
  let publicKey: string;
  let privateKey: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
    server = app.getHttpServer();
  });

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(server).post("/files").expect(400);

    expect(res.body.message).toContain("File is required");
  });

  it("should upload a file (POST /files)", async () => {
    const res = await request(server)
      .post("/files")
      .attach("file", path.join(__dirname, "test.txt"))
      .expect(201);

    expect(res.body).toHaveProperty("data.publicKey");
    expect(res.body).toHaveProperty("data.privateKey");

    publicKey = res.body.data.publicKey;
    privateKey = res.body.data.privateKey;
  });

  it("should download the uploaded file (GET /files/:publicKey)", async () => {
    const res = await request(server).get(`/files/${publicKey}`).expect(200);

    expect(res.headers["content-type"]).toMatch(
      /text\/plain|application\/octet-stream/
    );
    expect(res.headers["content-disposition"]).toMatch(/attachment/);
    expect(res.text).toContain("This is a test file");
  });

  it("should return 404 for deleted file (GET /files/:publicKey)", async () => {
    await request(server).get(`/files/wrong_key`).expect(404);
  });

  it("should delete the uploaded file (DELETE /files/:privateKey)", async () => {
    const res = await request(server)
      .delete(`/files/${privateKey}`)
      .expect(200);

    expect(res.body).toEqual({ message: "File deleted successfully" });
  });

  it("should return 404 for already deleted file (DELETE /files/:privateKey)", async () => {
    await request(server).delete(`/files/${privateKey}`).expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
