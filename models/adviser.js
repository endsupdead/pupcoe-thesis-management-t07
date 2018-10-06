const db = require('../db/db.js')

var actions = {
  classList: (filter,callback) => {
      const query =
      `SELECT users.id as student_id, users.first_name,users.last_name,class.id as class_id
      FROM class_members 
    inner join users on users.id = class_members.user_id
    inner join class ON class.id = class_members.class_id
      WHERE class.adviser_id = '${filter.id}'
      AND   class_members.user_id NOT IN 
      (select user_id from group_members) `;
       db.query(query)
      .then(res => callback(res.rows))
      .catch(e => {
        console.log(e)
        callback(e)
      })
    },
  classId: (filter,callback) => {
      const query =
      `select id from class where adviser_id = ${filter.id} `;
       db.query(query)
      .then(res => callback(res.rows))
      .catch(e => {
        console.log(e)
        callback(e)
      })
    },
  groupList: (filter,callback) => {
      const query =
      `select * from groups where class_id = ${filter.id} `;
       db.query(query)
      .then(res => callback(res.rows))
      .catch(e => {
        console.log(e)
        callback(e)
      })
    },
    insertStudent: (userData,callback) => {
    const query =
    `INSERT INTO 
      class_members (class_id,user_id) 
     VALUES 
      ('${userData.classid}','${userData.userid}') 
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    createGroup: (groupData,callback) => {
    const query =
    `INSERT INTO 
      groups (group_name,class_id) 
     VALUES 
      ('${groupData.groupName}','${groupData.classid}') 
      RETURNING id
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    insertMembers: (groupData,callback) => {
    const query =
    `INSERT INTO 
      group_members (group_id,user_id) 
     VALUES 
      ${groupData}
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
}
module.exports = actions