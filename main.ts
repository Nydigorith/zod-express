import express, { Request, Response, NextFunction } from "express";
import { z, AnyZodObject } from "zod";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isReasonableDate: z.RefinementEffect<string>["refinement"] = (
  val,
  ctx
) => {
  if (true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Should be less than 255 character`,
    });
  }
};

const dataSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: "Full name is required",
      })
      .superRefine(isReasonableDate),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Not a valid email"),
  }),
});

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (errors: any) {
      const formattedErrors: any = {};
      errors.issues.forEach((issue: any) => {
        formattedErrors[issue.path[1]] = issue.message;
      });

      // return res.status(422).json({
      //   errors,
      // });
      return res.status(422).json({
        success: false,
        error: formattedErrors,
      });
    }
  };

app.get("/", (req: Request, res: Response): Response => {
  return res.json({ message: "Validation with Zod 👊" });
});

app.post(
  "/create",
  validate(dataSchema),
  (req: Request, res: Response): Response => {
    return res.json({ ...req.body });
  }
);

const start = (): void => {
  try {
    app.listen(3333, () => {
      console.log("Server started on port 3333");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
