const { findOne, find, getDataWithSort } = require("../../../helpers");
const { ObjectID } = require("../../../types");

const filterData = async (req, res) => {
  try {
    const {
      contractType,
      _id,
      artType,
      proyectType,
      status,
      min,
      max,
      mintPrice,
      chainType,
      time,
    } = req.query;

    req.query;

    let queryObj = {};

    if (_id) {
      queryObj._id = _id;
    }

    if (contractType) {
      queryObj.contractType = { $in: contractType.split(",") };
    }

    if (artType) {
      queryObj.artType = { $in: artType.split(",") };
    }

    if (proyectType) {
      queryObj.proyectType = { $in: proyectType.split(",") };
    }

    if (chainType) {
      queryObj.chainType = { $in: chainType.split(",") };
    }

    if (min != "0" && max != "0") {
      queryObj.mintPrice = { $gte: min, $lte: max };
    }

    let sort = {};
    if (mintPrice) {
      sort.mintPrice = mintPrice === "false" ? -1 : 1;
    }

    console.log(queryObj, "queryObj");
    


    const launchpad = await getDataWithSort("launchPad", {status: "Deployed" , queryObj}, sort, {});
    // 1 Day = 86400 Seconds

    // const launchpad = await find("launchPad", { mintPrice: { $gte: min, $lte: max } })

    //console.log(launchpad, "launchpad");

    console.log(queryObj, "chainType");
    // totalTime Calcualte
    if (status === "PRESALE") {
      const pre = launchpad.filter(
        (data) =>
          data.startTime + Number(data.presaleDuration) * 86400000 > Date.now()
      );

      console.log(pre, "pre");

      // // live Users
      const live = pre.filter(
        (data) => data.startTime < time
        //  data.startTime + Number(data.presaleDuration) * 86400000 > time
      );

      //console.log(live,"live");
      // // Upcoming Users
      const upComing = pre.filter((data) => data.startTime > time);

      // console.log(upComing,"upComing");

      // Past Users
      const past = pre.filter(
        (data) =>
          data.startTime + Number(data.presaleDuration) * 86400000 < time
      );

      return res.status(200).send({ status: 200, live, upComing, past });
    } else if (status === "PUBLIC SALE") {
      const pre = launchpad.filter(
        (data) =>
          data.startTime + Number(data.presaleDuration) * 86400000 < Date.now()
      );

      const live = pre.filter(
        (data) => data.startTime < time
        //  data.startTime + Number(data.presaleDuration) * 86400000 > time
      );

      //console.log(live,"live");
      // // Upcoming Users
      const upComing = pre.filter((data) => data.startTime > time);

      // console.log(upComing,"upComing");

      // Past Users
      const past = pre.filter(
        (data) =>
          data.startTime + Number(data.presaleDuration) * 86400000 < time
      );

      return res.status(200).send({ status: 200, live, upComing, past });
    }

    //  if (preSale) {
    //   queryObj.preSale = pre;
    // }

    // const public = launchpad.filter(
    //   (data) =>
    //     data.startTime + Number(data.presaleDuration) * 86400000 >
    //      Date.now()
    // );

    // if (publicSale) {
    //   queryObj.publicSale = public;
    // }

    const timeDuration = launchpad.filter(
      (data) => data.startTime + Number(data.presaleDuration) * 86400000
    );

    // // live Users
    const live = launchpad.filter(
      (data) => data.startTime < time
      //  data.startTime + Number(data.presaleDuration) * 86400000 > time
    );

    //console.log(live,"live");
    // // Upcoming Users
    const upComing = timeDuration.filter((data) => data.startTime > time);

    // console.log(upComing,"upComing");

    // Past Users
    const past = timeDuration.filter(
      (data) => data.startTime + Number(data.presaleDuration) * 86400000 < time
    );

    //console.log(past,"past");

    if (!live || !upComing || !past) {
      return res.status(200).send({ status: 400, msg: "No Data Found" });
    }

    return res.status(200).send({ status: 200, live, upComing, past });
    // return res
    //   .status(200)
    //   .send({ status: 200, launchpad, nbHit: launchpad.length });
  } catch (e) {
    return res.status(400).send({ status: 500, message: e.message });
  }
};

module.exports = filterData;
