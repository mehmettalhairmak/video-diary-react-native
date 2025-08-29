import { MetadataForm } from "@/src/components/molecules/MetadataForm";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

describe("MetadataForm", () => {
  it("renders and updates inputs", () => {
    const onChange = jest.fn();
    render(<MetadataForm name="" description="" onChange={onChange} />);
    const nameInput = screen.getByPlaceholderText("Give it a name");
    fireEvent.changeText(nameInput, "Clip 1");
    expect(onChange).toHaveBeenCalledWith({ name: "Clip 1", description: "" });
  });

  it("shows errors and count colors when error props provided", () => {
    render(
      <MetadataForm
        name={"A".repeat(55)}
        description={"B".repeat(270)}
        errorName="Name required"
        errorDescription="Too long"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Name required")).toBeTruthy();
    expect(screen.getByText("Too long")).toBeTruthy();
    // counters visible
    expect(screen.getByText("55/60")).toBeTruthy();
    expect(screen.getByText("270/280")).toBeTruthy();
  });
});
