import sequelize from '../db/config.js';
import {DataTypes} from 'sequelize';
export const AdminAudit=sequelize.define('adminAudit',{
  actor:{type:DataTypes.STRING,allowNull:false},
  entity:{type:DataTypes.STRING,allowNull:false},
  entityId:{type:DataTypes.STRING,allowNull:false},
  operation:{type:DataTypes.STRING,allowNull:false},
  before:{type:DataTypes.JSON},after:{type:DataTypes.JSON},
},{indexes:[{fields:['entity','entityId']},{fields:['createdAt']}]});
