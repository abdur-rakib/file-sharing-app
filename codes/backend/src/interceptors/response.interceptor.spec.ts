import { ResponseInterceptor } from "./response.interceptor";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";
import { EStatusType } from "../common/enums/response.enum";

describe("ResponseInterceptor", () => {
  let interceptor: ResponseInterceptor;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  const mockContext = (
    headersSent = false,
    statusCode = 200
  ): ExecutionContext => {
    const mockResponse = {
      headersSent,
      statusCode,
    } as unknown as Response;

    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;
  };

  it("should return data as-is if response headers are already sent", (done) => {
    const context = mockContext(true, 200) as ExecutionContext;
    const callHandler: CallHandler = {
      handle: () => of("raw-stream-response"),
    };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result).toBe("raw-stream-response");
      done();
    });
  });

  it("should wrap structured response with status info", (done) => {
    const context = mockContext(false, 201) as ExecutionContext;
    const callHandler: CallHandler = {
      handle: () =>
        of({
          message: "File uploaded successfully",
          data: { publicKey: "abc", privateKey: "xyz" },
        }),
    };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result).toEqual({
        status: EStatusType.SUCCESS,
        statusCode: 201,
        message: "File uploaded successfully",
        data: {
          publicKey: "abc",
          privateKey: "xyz",
        },
      });
      done();
    });
  });

  it("should wrap unstructured response with default message", (done) => {
    const context = mockContext(false, 200) as ExecutionContext;
    const callHandler: CallHandler = {
      handle: () => of({ id: 1 }),
    };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result).toEqual({
        status: EStatusType.SUCCESS,
        statusCode: 200,
        message: "Request was successful",
        data: { id: 1 },
      });
      done();
    });
  });
});
