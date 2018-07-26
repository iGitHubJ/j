
/** 数据库结构
 -- Uin 数据库
 ---- group 数据仓库
        { md5: { groupName, tos: { premd5: { NickName, RemarkName } } } }
        ...
 ---- msg 数据仓库
        { key: { Type, Content, premd5s: [] } }
        ...
 */


import localforage from 'localforage'

/**
 * 
 * @param {*} name 数据库名称 - Uin
 * @param {*} storeName 数据仓库名称 - group | msg
 */
const getStore = (name, storeName) => {
  return localforage.createInstance({ name, storeName })
}

const methods = {
  //////////////////
  // group

  /**
   * 新增组 or
   * 修改组，用户选择联系人时导致tos发生变化
   * 
   * @param {*} arg { Uin, md5, group }
   * group: { groupName, tos: { premd5: { NickName, RemarkName } } }
   */
  async setGroup ({ Uin, md5, group }) {
    const store = getStore(Uin, 'group')
    await store.setItem(md5, group)
  },

  /**
   * 获取当前用户的所有组
   * 
   * @param {String} Uin
   * @returns {Array} [{ md5, groupName }]
   */
  async getGroupList (Uin) {
    const store = getStore(Uin, 'group')
    let arr = []
    await store.iterate((value, key) => {
      arr.push({ md5: key, groupName: value.groupName })
    })
    return arr
  },

  /**
   * 删除组
   * 
   * @param {*} arg { Uin, md5 }
   */
  async delGroup ({ Uin, md5 }) {
    const store = getStore(Uin, 'group')
    await store.removeItem(md5)
  },

  /**
   * 获取组，得到 tos
   * 
   * @param {*} arg { Uin, md5 }
   * @returns {Object}
   * group: { groupName, tos: { premd5: { NickName, RemarkName } } }
   */
  async getGroup ({ Uin, md5 }) {
    const store = getStore(Uin, 'group')
    const group = await store.getItem(md5)
    return group
  },

  //////////////////
  // msg

  /**
   * 
   * @param { Uin, key, msg }
   * msg: { key: { Type, (Content || file), tos: { premd5: failCount } }
   */
  async setMsg ({ Uin, key, msg }) {
    const store = getStore(Uin, 'msg')
    await store.setItem(key, msg)
  },
  
  async getMsg ({ Uin, key }) {
    const store = getStore(Uin, 'msg')
    const msg = await store.getItem(key)
    return msg
  }
}

const createErr = (status, message) => {
  const err = new Error(message)
  err.status = status
  return err
}

export default async (method, arg) => {
  try {
    /* istanbul ignore else */
    if (methods[method]) {
      const res = await methods[method](arg)
      return res
    }
  } catch (err) {
    throw createErr(1000, err.message || '数据库错误')
  }
}