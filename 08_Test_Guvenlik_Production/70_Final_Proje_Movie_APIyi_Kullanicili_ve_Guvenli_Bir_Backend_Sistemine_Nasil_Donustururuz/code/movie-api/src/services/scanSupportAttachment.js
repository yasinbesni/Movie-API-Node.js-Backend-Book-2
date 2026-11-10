import { createConnection } from "node:net";

export const scanSupportAttachment = async (buffer) => {
  const host = process.env.CLAMAV_HOST?.trim();
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const unavailable = () => {
    const error = new Error("Dosya güvenlik taraması şu anda kullanılamıyor.");
    error.status = 503;
    return error;
  };

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw unavailable();
  }

  // ClamAV INSTREAM: komut, 4 baytlık uzunluk, veri, sıfır uzunluk.
  let answer;
  try {
    answer = await new Promise((resolve, reject) => {
      const socket = createConnection({ host, port });
      let settled = false;
      let received = Buffer.alloc(0);

      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        if (error) reject(error);
        else resolve(value);
      };

      socket.setTimeout(15000, () => finish(new Error("Tarama zaman aşımı")));
      socket.on("error", (error) => finish(error));
      socket.on("close", () => finish(new Error("Tarama bağlantısı kapandı")));
      socket.on("connect", () => {
        const size = Buffer.alloc(4);
        size.writeUInt32BE(buffer.length);
        socket.write(Buffer.concat([
          Buffer.from("zINSTREAM\0"), size, buffer, Buffer.alloc(4),
        ]));
      });
      socket.on("data", (chunk) => {
        received = Buffer.concat([received, chunk]);
        if (received.length > 1024) {
          return finish(new Error("Beklenmeyen tarama yanıtı"));
        }
        const end = received.indexOf(0);
        if (end !== -1) finish(null, received.subarray(0, end).toString());
      });
    });
  } catch {
    throw unavailable();
  }

  if (answer === "stream: OK") return;
  if (answer.startsWith("stream: ") && answer.endsWith(" FOUND")) {
    const error = new Error("Dosya güvenlik kontrolünden geçemedi.");
    error.status = 422;
    throw error;
  }
  // Tarama tamamlanmadıysa dosyayı 'temiz' saymıyoruz.
  throw unavailable();
};
