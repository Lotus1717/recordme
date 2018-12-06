console.log('model-script')

let domain = 'http://148.70.2.7/'
// let domain = 'http://127.0.0.1:8007/'

const updateRecordList = (data) => {
  let url = domain + 'RecordServer/updateRecord'
  return axios.post(url, data).then(res => {
    return res.data
  })
}

const deleteMark = (data) => {
  let url = domain + 'RecordServer/deleteMark'
  return axios.post(url, data).then(res => {
    return res.data
  })
}

const login = (data) => {
  let url = domain + 'UserServer/login'
  return axios.post(url, data).then(res => {
    return res.data
  })
}

export {
  updateRecordList,
  deleteMark,
  login
}