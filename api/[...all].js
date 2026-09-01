export default async function handler(req, res) {
  const { default: serverlessHandler } = await import("../dist/serverless.js");
  return serverlessHandler(req, res);
}
