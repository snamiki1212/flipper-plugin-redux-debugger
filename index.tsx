import React, { memo } from "react";
import {
  PluginClient,
  createState,
  DataTable,
  DataInspector,
  usePlugin,
  useValue,
  Panel,
  Layout,
  DetailSidebar,
  Tabs,
  Tab,
  useMemoize,
  DataTableColumn,
} from "flipper-plugin";
import { Button, Input, message } from "antd";
import { ColorizedAction } from "./renderAction";

const MemoizedColorizedAction = memo(ColorizedAction);

const { TextArea } = Input;

type Action = {
  type: string;
  payload: object;
};

type ActionState = {
  id: number;
  time: string;
  took: string;
  action: Action;
  before: object;
  after: object;
};

type Events = { actionDispatched: ActionState; actionInit: ActionState };

const columns: DataTableColumn[] = [
  {
    key: "id",
    visible: false,
  },
  {
    key: "time",
    title: "Time",
  },
  {
    key: "colorizedAction",
    title: "Action",
    onRender: (row: MyRow, selected: boolean, index: number) => (
      <MemoizedColorizedAction actionName={row.colorizedAction} />
    ),
  },
  {
    key: "duration",
    title: "Duration",
  },
  {
    key: "action",
    title: "SearchableAction",
    visible: false,
  },
];

type MyRow = {
  id: number;
  time: string;
  action: string;
  colorizedAction: string;
  duration: string;
};

const createRows = (actions: ActionState[]) =>
  actions.map((action) => createRow(action));

const createRow = (action: ActionState): MyRow => ({
  id: action.id,
  time: action.time,
  action: action.action.type,
  colorizedAction: action.action.type,
  duration: action.took,
});

export function plugin(client: PluginClient<Events, {}>) {
  const selectedID = createState<number | null>(null, { persist: "selection" });
  const actions = createState<ActionState[]>([], { persist: "actions" });
  const actionType = createState<string>();
  const actionPayloadString = createState<string>();

  message.config({ duration: 2, maxCount: 3 });

  client.onMessage("actionDispatched", (newAction: ActionState) => {
    actions.update((currentActions) => {
      if (newAction.action) {
        currentActions.push(newAction);
      }
    });
  });

  client.onMessage("actionInit", (newAction) => {
    actions.set([newAction]);
    selectedID.set(newAction.id);
  });

  function setSelection(id: number) {
    selectedID.set(id);
  }

  function clearAction() {
    actions.set([]);
  }

  function setActionType(event) {
    actionType.set(event.target.value);
  }

  function setActionPayloadString(event) {
    actionPayloadString.set(event.target.value);
  }

  async function sendDispatchMessage() {
    if (client.isConnected) {
      try {
        const payloadStringValue = actionPayloadString.get();
        const actionTypeValue = actionType.get();
        let actionPayload;
        try {
          actionPayload =
            payloadStringValue.trim() == ""
              ? []
              : JSON.parse(payloadStringValue);
        } catch (e) {
          //can happen when we try to parse a string input
          message.error("Invalid JSON format in the payload");
          actionPayload = payloadStringValue;
        }

        await client.send("dispatchAction", {
          type: actionTypeValue,
          payload: actionPayload,
        });
        message.success("The action is dispatched");
      } catch (e) {
        message.error("Failed to get response from client " + e);
      }
    }
  }

  return {
    actions,
    selectedID,
    actionType,
    actionPayloadString,
    clearAction,
    setSelection,
    sendDispatchMessage,
    setActionPayloadString,
    setActionType,
  };
}

export function Component() {
  const instance = usePlugin(plugin);
  const actions = useValue(instance.actions);
  const selectedId = useValue(instance.selectedID);
  const actionType = useValue(instance.actionType);
  const actionPayloadString = useValue(instance.actionPayloadString);

  const rows = useMemoize((actions) => createRows(actions), [actions]);

  const selectedData = actions.find((act) => act.id === selectedId);
  return (
    <>
      <Panel title="Dispatch Action to the app" gap pad>
        <Input
          allowClear
          value={actionType}
          onChange={instance.setActionType}
        />
        <TextArea
          rows={4}
          value={actionPayloadString}
          onChange={instance.setActionPayloadString}
        />
        <Button onClick={instance.sendDispatchMessage}>Dispatch Action</Button>
      </Panel>
      <DataTable<MyRow>
        records={rows}
        recordsKey="id"
        columns={columns}
        enableSearchbar={true}
        enableAutoScroll={true}
        enableMultiSelect={false}
        enableColumnHeaders={true}
        onSelect={(record) => {
          instance.setSelection(record?.id);
        }}
        extraActions={<Button onClick={instance.clearAction}>Clear</Button>}
      />
      <DetailSidebar width={400}>{renderSidebar(selectedData)}</DetailSidebar>
    </>
  );
}

function renderSidebar(selectedData: ActionState) {
  if (!selectedData) {
    return;
  }

  const { type, ...payload } = selectedData?.action;
  const actionData = {
    type,
    payload,
  };

  return (
    <Layout.Container gap pad>
      <Panel title="Action" gap pad>
        <DataInspector
          data={actionData}
          collapsed={true}
          expandRoot={true}
        ></DataInspector>
      </Panel>
      <Panel title="State" gap pad>
        <Tabs defaultActiveKey="Diff" centered={true}>
          <Tab tab="Diff" tabKey="Diff">
            <DataInspector
              diff={selectedData.before}
              data={selectedData.after}
              collapsed={true}
              expandRoot={false}
            ></DataInspector>
          </Tab>
          <Tab tab="State Tree" tabKey="StateTree">
            <DataInspector
              data={selectedData.after}
              collapsed={true}
              expandRoot={false}
            ></DataInspector>
          </Tab>
        </Tabs>
      </Panel>
    </Layout.Container>
  );
}
