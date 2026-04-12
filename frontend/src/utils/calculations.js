import { 
  CalculateProduction, 
  CalculateGasProfit, 
  CalculateGoalTime,
  CalculateDrillAffordTime,
  BatchCalculate
} from "../../wailsjs/go/main/App";

export const calculateProduction = async (rate, cashPerUnit, boost) => {
  return await CalculateProduction(parseFloat(rate) || 0, cashPerUnit, boost);
};

export const calculateGasProfit = async (gasAmount, cashPerUnit, boost) => {
  return await CalculateGasProfit(gasAmount, cashPerUnit, boost);
};

export const calculateDrillTime = async (rate, currentCash, cashPerUnit, boost, drillSelections, drills) => {
  return await CalculateDrillAffordTime(rate, currentCash, cashPerUnit, boost, drillSelections);
};

export const calculateGoalTime = async (rate, currentCash, cashPerUnit, boost, goalAmount) => {
  return await CalculateGoalTime(rate, currentCash, goalAmount, cashPerUnit, boost);
};

export const batchCalculate = async (rate, currentCash, cashPerUnit, boost, gasAmount, goalAmount, drillSelections) => {
  return await BatchCalculate({
    rate_per_second: parseFloat(rate) || 0,
    current_cash: parseFloat(currentCash) || 0,
    cash_per_unit: cashPerUnit,
    boost_percent: boost,
    gas_amount_str: gasAmount,
    goal_amount_str: goalAmount,
    drill_selections: drillSelections
  });
};