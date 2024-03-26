module.exports = new (class Jwt {
  generateToken(payload) {
    const binaryData = Buffer.from(JSON.stringify(payload), "utf-8").toString(
      "base64"
    );
    return binaryData;
  }

  verifyToken(token) {
    const jsonData = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(jsonData);
  }
})();
