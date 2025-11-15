function loadTrainData() {
  throw new Error('not implemented')
}

function listTrainsByRoute(origin, destination, date) {
  throw new Error('not implemented')
}

function filterTrainsByType(list, types) {
  throw new Error('not implemented')
}

function getTrainDetail(trainNo) {
  throw new Error('not implemented')
}

function computePriceBySeat(trainNo, seatType, origin, destination) {
  throw new Error('not implemented')
}

function computeSeatAvailability(trainNo, seatType, origin, destination) {
  throw new Error('not implemented')
}

module.exports = {
  loadTrainData,
  listTrainsByRoute,
  filterTrainsByType,
  getTrainDetail,
  computePriceBySeat,
  computeSeatAvailability,
}