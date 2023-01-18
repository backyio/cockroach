// Copyright 2022 The Cockroach Authors.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the Apache License, Version 2.0, included in the file
// licenses/APL.txt.

import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AppState } from "src/store";
import { actions as localStorageActions } from "src/store/localStorage";
import { actions as sqlActions } from "src/store/sqlStats";
import {
  TransactionInsightsViewDispatchProps,
  TransactionInsightsViewStateProps,
} from "./transactionInsights";
import {
  StatementInsightsViewDispatchProps,
  StatementInsightsViewStateProps,
} from "./statementInsights";
import { WorkloadInsightEventFilters } from "../types";
import {
  WorkloadInsightsViewProps,
  WorkloadInsightsRootControl,
} from "./workloadInsightRootControl";
import { SortSetting } from "src/sortedtable";
import {
  actions as statementInsights,
  selectColumns,
  selectInsightTypes,
  selectStmtInsights,
  selectStmtInsightsError,
  selectStmtInsightsLoading,
} from "src/store/insights/statementInsights";
import {
  actions as transactionInsights,
  selectTransactionInsights,
  selectTransactionInsightsError,
  selectFilters,
  selectSortSetting,
  selectTransactionInsightsLoading,
} from "src/store/insights/transactionInsights";
import { Dispatch } from "redux";
import { TimeScale } from "../../timeScaleDropdown";
import { StmtInsightsReq } from "src/api";
import { selectTimeScale } from "../../store/utils/selectors";

const transactionMapStateToProps = (
  state: AppState,
  _props: RouteComponentProps,
): TransactionInsightsViewStateProps => ({
  isDataValid: state.adminUI.txnInsights?.valid,
  lastUpdated: state.adminUI.txnInsights.lastUpdated,
  transactions: selectTransactionInsights(state),
  transactionsError: selectTransactionInsightsError(state),
  insightTypes: selectInsightTypes(),
  filters: selectFilters(state),
  sortSetting: selectSortSetting(state),
  timeScale: selectTimeScale(state),
  isLoading: selectTransactionInsightsLoading(state),
});

const statementMapStateToProps = (
  state: AppState,
  _props: RouteComponentProps,
): StatementInsightsViewStateProps => ({
  isDataValid: state.adminUI.stmtInsights?.valid,
  lastUpdated: state.adminUI.stmtInsights.lastUpdated,
  statements: selectStmtInsights(state),
  statementsError: selectStmtInsightsError(state),
  insightTypes: selectInsightTypes(),
  filters: selectFilters(state),
  sortSetting: selectSortSetting(state),
  selectedColumnNames: selectColumns(state),
  timeScale: selectTimeScale(state),
  isLoading: selectStmtInsightsLoading(state),
});

const TransactionDispatchProps = (
  dispatch: Dispatch,
): TransactionInsightsViewDispatchProps => ({
  onFiltersChange: (filters: WorkloadInsightEventFilters) =>
    dispatch(
      localStorageActions.update({
        key: "filters/InsightsPage",
        value: filters,
      }),
    ),
  onSortChange: (ss: SortSetting) =>
    dispatch(
      localStorageActions.update({
        key: "sortSetting/InsightsPage",
        value: ss,
      }),
    ),
  setTimeScale: (ts: TimeScale) => {
    dispatch(
      sqlActions.updateTimeScale({
        ts: ts,
      }),
    );
  },
  refreshTransactionInsights: (req: StmtInsightsReq) => {
    dispatch(transactionInsights.refresh(req));
  },
});

const StatementDispatchProps = (
  dispatch: Dispatch,
): StatementInsightsViewDispatchProps => ({
  onFiltersChange: (filters: WorkloadInsightEventFilters) =>
    dispatch(
      localStorageActions.update({
        key: "filters/InsightsPage",
        value: filters,
      }),
    ),
  onSortChange: (ss: SortSetting) =>
    dispatch(
      localStorageActions.update({
        key: "sortSetting/InsightsPage",
        value: ss,
      }),
    ),
  // We use `null` when the value was never set and it will show all columns.
  // If the user modifies the selection and no columns are selected,
  // the function will save the value as a blank space, otherwise
  // it gets saved as `null`.
  onColumnsChange: (value: string[]) =>
    dispatch(
      localStorageActions.update({
        key: "showColumns/StatementInsightsPage",
        value: value.length === 0 ? " " : value.join(","),
      }),
    ),
  setTimeScale: (ts: TimeScale) => {
    dispatch(
      sqlActions.updateTimeScale({
        ts: ts,
      }),
    );
  },
  refreshStatementInsights: (req: StmtInsightsReq) => {
    dispatch(statementInsights.refresh(req));
  },
});

type StateProps = {
  transactionInsightsViewStateProps: TransactionInsightsViewStateProps;
  statementInsightsViewStateProps: StatementInsightsViewStateProps;
};

type DispatchProps = {
  transactionInsightsViewDispatchProps: TransactionInsightsViewDispatchProps;
  statementInsightsViewDispatchProps: StatementInsightsViewDispatchProps;
};

export const WorkloadInsightsPageConnected = withRouter(
  connect<
    StateProps,
    DispatchProps,
    RouteComponentProps,
    WorkloadInsightsViewProps
  >(
    (state: AppState, props: RouteComponentProps) => ({
      transactionInsightsViewStateProps: transactionMapStateToProps(
        state,
        props,
      ),
      statementInsightsViewStateProps: statementMapStateToProps(state, props),
    }),
    dispatch => ({
      transactionInsightsViewDispatchProps: TransactionDispatchProps(dispatch),
      statementInsightsViewDispatchProps: StatementDispatchProps(dispatch),
    }),
    (stateProps, dispatchProps) => ({
      transactionInsightsViewProps: {
        ...stateProps.transactionInsightsViewStateProps,
        ...dispatchProps.transactionInsightsViewDispatchProps,
      },
      statementInsightsViewProps: {
        ...stateProps.statementInsightsViewStateProps,
        ...dispatchProps.statementInsightsViewDispatchProps,
      },
    }),
  )(WorkloadInsightsRootControl),
);
