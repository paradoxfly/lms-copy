let fileTypeFromBuffer;

(async () => {
  const fileType = await import('file-type');
  fileTypeFromBuffer = fileType.fileTypeFromBuffer;
})();

exports.parseBook = async (book) => {
  if (!fileTypeFromBuffer) {
    const fileType = await import('file-type');
    fileTypeFromBuffer = fileType.fileTypeFromBuffer;
  }
  const fileType = await fileTypeFromBuffer(book.image);
  const base64Image = book.image.toString("base64");
  const image = `data:${fileType.mime};base64,${base64Image}`;
  return { ...book.dataValues, image };
};
