import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InvitedTalks from "@/components/InvitedTalks";
import { makeDictionary, makeInvitedTalk } from "@/__tests__/helpers/fixtures";

const t = makeDictionary();

describe("InvitedTalks", () => {
  it("renders talk title, venue, location, and date", () => {
    const talk = makeInvitedTalk({
      title: "My Talk",
      venue: "Workshop Y",
      location: "Kyoto",
      date: "2024-01",
    });
    render(<InvitedTalks t={t} invitedTalks={[talk]} />);
    expect(screen.getByText("My Talk")).toBeInTheDocument();
    expect(screen.getByText(/Workshop Y/)).toBeInTheDocument();
    expect(screen.getByText(/Kyoto/)).toBeInTheDocument();
    expect(screen.getByText("2024-01")).toBeInTheDocument();
  });

  it("renders multiple talks", () => {
    const talks = [
      makeInvitedTalk({ title: "Talk A" }),
      makeInvitedTalk({ title: "Talk B" }),
    ];
    render(<InvitedTalks t={t} invitedTalks={talks} />);
    expect(screen.getByText("Talk A")).toBeInTheDocument();
    expect(screen.getByText("Talk B")).toBeInTheDocument();
  });
});
