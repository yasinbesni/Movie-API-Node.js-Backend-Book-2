import { submitSupportRequest } from "../services/support.js";

export const submitSupportRequestController = async (req, res) => {
  await submitSupportRequest({
    user: req.user,
    message: req.body.message,
  });

  res.status(200).json({
    message: "Yardım talebiniz e-posta hizmetine iletildi.",
  });
};
