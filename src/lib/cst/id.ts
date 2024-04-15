let _id = 1
export function id() {
    return `${_id++}`
}

export function _resetId() {
    _id = 1
}
