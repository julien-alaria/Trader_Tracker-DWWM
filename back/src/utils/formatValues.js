function formatValues(value) {

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + " B"
  }

  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + " M"
  }

  return value.toString()
}

export default formatValues