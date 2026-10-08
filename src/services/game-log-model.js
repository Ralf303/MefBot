import {DataTypes} from 'sequelize';
import sequelize from '../db/config.js';

export const GameLog=sequelize.define('gameLog',{
  id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
  type:{type:DataTypes.STRING(48),allowNull:false},
  status:{type:DataTypes.STRING(16),allowNull:false,defaultValue:'success'},
  source:{type:DataTypes.STRING(16),allowNull:false,defaultValue:'bot'},
  actorId:{type:DataTypes.INTEGER},actorTelegramId:{type:DataTypes.STRING(24)},
  chatId:{type:DataTypes.STRING(24)},action:{type:DataTypes.STRING(255),allowNull:false},
  global:{type:DataTypes.BOOLEAN,allowNull:false,defaultValue:false},
  details:{type:DataTypes.JSON,allowNull:false},
},{updatedAt:false,indexes:[{fields:['createdAt','id']},{fields:['type','createdAt']},{fields:['source','createdAt']},{fields:['chatId','createdAt']},{fields:['status','createdAt']}]});
export const GameLogUser=sequelize.define('gameLogUser',{
  id:{type:DataTypes.BIGINT,primaryKey:true,autoIncrement:true},
  logId:{type:DataTypes.BIGINT,allowNull:false},userId:{type:DataTypes.INTEGER},
  telegramId:{type:DataTypes.STRING(24)},name:{type:DataTypes.STRING(120)},username:{type:DataTypes.STRING(64)},
},{timestamps:false,indexes:[{fields:['userId','logId']},{fields:['telegramId','logId']},{fields:['logId']}]});
GameLog.hasMany(GameLogUser,{as:'participants',foreignKey:'logId',onDelete:'CASCADE'});
GameLogUser.belongsTo(GameLog,{foreignKey:'logId'});
export async function syncGameLogs(){await GameLog.sync();await GameLogUser.sync();}
