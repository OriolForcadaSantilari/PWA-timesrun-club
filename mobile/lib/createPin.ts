export type MeetingPin = {
  lat: number;
  lng: number;
  label: string;
};

let pendingPin: MeetingPin | null = null;

export function stashMeetingPin(pin: MeetingPin) {
  pendingPin = pin;
}

export function takeMeetingPin(): MeetingPin | null {
  const pin = pendingPin;
  pendingPin = null;
  return pin;
}

export const barcelonaRegion = {
  latitude: 41.3874,
  longitude: 2.1686,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};
