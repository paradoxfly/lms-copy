const { fileTypeFromBuffer } = require("file-type");

exports.parseBook = async (book) => {
  const fileType = await fileTypeFromBuffer(book.image);
  const base64Image = book.image.toString("base64");
  const image = `data:${fileType.mime};base64,${base64Image}`;
  return { ...book.dataValues, image };
};
