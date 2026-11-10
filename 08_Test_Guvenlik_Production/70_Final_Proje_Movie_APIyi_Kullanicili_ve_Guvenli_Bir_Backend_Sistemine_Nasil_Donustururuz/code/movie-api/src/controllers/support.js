import { submitSupportRequest } from "../services/support.js";

export const submitSupportRequestController = async (req, res) => {
  await submitSupportRequest({
    user: req.user,
    message: req.body.message,
    file: req.file, // Dosya yoksa undefined; bu geçerlidir.
  });
  res.status(200).json({
    message: "Yardım talebiniz e-posta hizmetine iletildi.",
  });
};
