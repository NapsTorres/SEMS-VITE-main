/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from "antd";
import { useFetchData } from "../../../config/axios/requestData";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useEventsRequest from "../../../config/data/events";
import EventsServices from "../../../config/service/events";
import { Events } from "../../../types";
import dayjs from "dayjs";

export default function useEventsHooks() {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvents, setEditingEvents] = useState<Events | null>(null);
  const [form] = Form.useForm();
  const { isLoading, addEventsMutation, deleteEventsMutation, editEventsMutation } =
    useEventsRequest({
      setIsModalVisible,
    });
  const { data: Events, isLoading: isFetchingEvents } = useFetchData(
    ["Events"],
    [() => EventsServices.fetchEvents()]
  );

  const handleAddOrEditEvent = (values: Events) => {
    const formData = new FormData();
    formData.append("eventName", values.eventName);
    formData.append("description", values.description);
    formData.append("eventYear", new Date().getFullYear().toString());

    // Adjust dates to UTC to avoid timezone shifts
    const startDateUTC = new Date(
      Date.UTC(
        values.eventstartDate.year(),
        values.eventstartDate.month(),
        values.eventstartDate.date()
      )
    );
    const endDateUTC = new Date(
      Date.UTC(
        values.eventendDate.year(),
        values.eventendDate.month(),
        values.eventendDate.date()
      )
    );

    formData.append("eventstartDate", startDateUTC.toISOString());
    formData.append("eventendDate", endDateUTC.toISOString());

    if (editingEvents) {
      formData.append("eventId", editingEvents.eventId.toString());
    }

    const mutation = editingEvents ? editEventsMutation : addEventsMutation;
    mutation(formData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["Events"] });
        form.resetFields();
      },
    });
  };

  const handleDeleteEvents = (eventId: any) => {
    deleteEventsMutation(eventId, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Events"] }),
    });
  };

  const showModal = (team: Events | null = null) => {
    setEditingEvents(team);
    if (team) {
      // Adjust initial values to match dayjs for form handling
      team.eventendDate = dayjs.utc(team.eventendDate);
      team.eventstartDate = dayjs.utc(team.eventstartDate);
      form.setFieldsValue(team);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const loading = isLoading || isFetchingEvents;
  return {
    Events,
    isModalVisible,
    editingEvents,
    form,
    loading,
    handleAddOrEditEvent,
    setIsModalVisible,
    handleDeleteEvents,
    showModal,
  };
}
