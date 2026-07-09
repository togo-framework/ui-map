import type { Meta, StoryObj } from "@storybook/react";
import { MapView } from "../components/map/MapView";

const meta: Meta<typeof MapView> = {
  title: "Components/Map View",
  component: MapView,
  tags: ["autodocs"],
  parameters: { fullBleed: true, docs: { story: { inline: false, height: "520px" }, description: { component: "Real OpenStreetMap via leaflet (SSR-safe, client-only)." } } },
};
export default meta;
type Story = StoryObj<typeof MapView>;

export const Doha: Story = {
  args: {
    center: [25.2854, 51.531],
    zoom: 11,
    height: 460,
    markers: [
      { lat: 25.2854, lng: 51.531, label: "Doha" },
      { lat: 25.33, lng: 51.49, label: "West Bay", color: "hsl(217 91% 60%)" },
    ],
  },
};

export const World: Story = {
  args: { center: [20, 0], zoom: 2, height: 460, markers: [
    { lat: 51.5, lng: -0.12, label: "London" },
    { lat: 40.7, lng: -74, label: "New York" },
    { lat: 35.7, lng: 139.7, label: "Tokyo" },
  ] },
};
