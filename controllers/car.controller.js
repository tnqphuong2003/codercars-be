const { sendResponse, AppError } = require("../helpers/utils.js");

const mongoose = require("mongoose");
const Car = require("../models/Car");
const carController = {};

carController.createCar = async (req, res, next) => {
  const { make, model, release_date, transmission_type, size, style, price } =
    req.body;

  try {
    if (
      !make ||
      !model ||
      !release_date ||
      !transmission_type ||
      !size ||
      !style ||
      !price
    ) {
      const exception = new Error(`Missing body info`);
      exception.statusCode = 401;
      throw exception;
    }

    const info = {
      make: make,
      model: model,
      release_date: release_date,
      transmission_type: transmission_type,
      size: size,
      style: style,
      price: price,
    };

    //always remember to control your inputs
    if (!info) throw new AppError(402, "Bad Request", "Create Car Error");
    //mongoose query
    const created = await Car.create(info);
    sendResponse(res, 200, true, { data: created }, null, "Create Car Success");
  } catch (err) {
    next(err);
  }
};

carController.getCars = async (req, res, next) => {
  const filter = {};
  const allowedFilter = ["type", "search", "page", "limit"];

  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    let offset = limit * (page - 1);

    //mongoose query
    const listOfFound = await Car.find(filter);
    console.log(listOfFound.length);

    let result = [];
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.length
          ? result.filter((car) => car[condition] === filterQuery[condition])
          : listOfFound.filter(
              (car) => car[condition] === filterQuery[condition]
            );
      });
    } else {
      result = listOfFound;
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    let dataResult = {
      cars: result,
      total: Math.ceil(listOfFound.length / limit),
      page: page,
    };

    sendResponse(
      res,
      200,
      true,
      { data: dataResult },
      null,
      "Found list of cars success"
    );
  } catch (err) {
    next(err);
  }
};

carController.editCar = async (req, res, next) => {
  let targetId = req.params.id;
  console.log(targetId);
  try {
    if (!targetId) {
      const exception = new Error(`Id is not null`);
      exception.statusCode = 401;
      throw exception;
    }

    if (!mongoose.isValidObjectId(targetId)) {
      const exception = new Error(`Id type is invalid`);
      exception.statusCode = 401;
      throw exception;
    }

    targetId = mongoose.Types.ObjectId(targetId);

    const updateInfo = req.body;
    const allowUpdate = [
      "make",
      "model",
      "release_date",
      "transmission_type",
      "size",
      "style",
      "price",
    ];

    const updateKeys = Object.keys(updateInfo);
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));
    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }

    //find car by id
    const targetCar = await Car.findById(targetId);
    if (!targetCar) {
      const exception = new Error(`Car not found`);
      exception.statusCode = 404;
      throw exception;
    }

    const options = { new: true };

    const updated = await Car.findByIdAndUpdate(targetId, updateInfo, options);
    sendResponse(res, 200, true, { data: updated }, null, "Update car success");
  } catch (err) {
    next(err);
  }
};

carController.deleteCar = async (req, res, next) => {
  const targetId = req.params.id;

  try {
    if (!targetId) {
      const exception = new Error(`Id is not null`);
      exception.statusCode = 401;
      throw exception;
    }

    if (!mongoose.isValidObjectId(targetId)) {
      const exception = new Error(`Id type is invalid`);
      exception.statusCode = 401;
      throw exception;
    }

    targetId = mongoose.Types.ObjectId(targetId);
    //find car by id
    const targetCar = await Car.findById(targetId);
    if (!targetCar) {
      const exception = new Error(`Car not found`);
      exception.statusCode = 404;
      throw exception;
    }

    const options = { new: true };

    const deleted = await Car.findByIdAndUpdate(
      targetId,
      { isDeleted: true },
      options
    );
    sendResponse(res, 200, true, { data: deleted }, null, "Delete car success");
  } catch (err) {
    next(err);
  }
};

module.exports = carController;
