module.exports = {
  stringify: (value) => {
    // Works the same as JSON.stringify,
    // but also handles BigInt type:
    if (value !== undefined) {
      return JSON.parse(
        JSON.stringify(value, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      );
    }
  },
  filterObj: (roundDetails) => {
    for (key in roundDetails) {
      if (!isNaN(key)) {
        delete roundDetails[key];
      }
    }
  },
};
