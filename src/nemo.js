const axios = require("axios");

module.exports = function (RED) {
  // Node de connexion
  function NemoConnection(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on("input", async (msg) => {
      const baseUrl = config.baseUrl || msg.url || "https://www.nemocloud.com/AirQualityAPI";
      const url = `${baseUrl}/session/login`;

      try {
        const response = await axios.post(
          url,
          {
            company: config.company || msg.payload.company,
            operator: config.operator || msg.payload.operator,
            password: config.password || msg.payload.password,
          },
          {
            headers: {
              Authorization: config.authorization || msg.headers.authorization,
              "Accept-version": config.acceptVersion || msg.headers.acceptVersion || "v4",
              "Content-Type": "application/json",
            },
          }
        );

        msg.payload = response.data;
        node.send(msg);
      } catch (error) {
        node.error("Error connecting to NemoCloud API", error);
      }
    });
  }

  // Node de récupération des dernières valeurs
  function NemoLastValues(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on("input", async (msg) => {
      const baseUrl = config.baseUrl || msg.url || "https://www.nemocloud.com/AirQualityAPI";
      const sensorId = config.sensorId || msg.payload.sensorId;
      const count = config.count || msg.payload.count || 1;
      const sessionId = config.sessionId || msg.payload.sessionId;
      const url = `${baseUrl}/devices/${sensorId}/lastValues?count=${count}`;

      try {
        const response = await axios.get(url, {
          headers: {
            "Accept-version": config.acceptVersion || msg.headers.acceptVersion || "v4",
            sessionId: sessionId,
          },
        });

        msg.payload = response.data;
        node.send(msg);
      } catch (error) {
        node.error("Error fetching last values from NemoCloud API", error);
      }
    });
  }

  RED.nodes.registerType("nemocloud-login", NemoConnection);
  RED.nodes.registerType("nemocloud-lastvalues", NemoLastValues);
};
