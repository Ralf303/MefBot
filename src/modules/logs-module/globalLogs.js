// Compatibility for old callers. Actual model changes are captured by the journal.
import {noteLog} from '../../services/game-log-service.js';
export const giveResoursesLog=(user,receiver,item,count)=>noteLog('currency.transfer',{resource:item,amount:count},[user,receiver]);
export const gamesLog=(user,game,win,previous)=>noteLog('game.play',{game,win,previousBalance:previous,balance:user.balance},[user]);
export const loseLog=(user,item,reason)=>noteLog(undefined,{lost:item,reason},[user]);
export const resiveLog=(user,item,count,reason)=>noteLog(undefined,{resource:item,amount:count,reason},[user]);
