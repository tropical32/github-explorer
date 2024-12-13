import { render, screen, fireEvent, waitFor } from "./test-utils";
import "@testing-library/jest-dom";
import GithubListing from "./GithubListing";
import jestMock from "jest-mock";

beforeEach(() => {
  Element.prototype.scrollIntoView = jestMock.fn();
})

test("tests the dropdown visibility on focus", async () => {
  render(<GithubListing />);

  const dropdown = await screen.queryByTestId("dropdown");
  expect(dropdown).toBeNull();

  const searchInput = (await screen.getByTestId(
    "search-input",
  )) as HTMLInputElement;

  fireEvent.focus(searchInput);

  const visibleDropdown = await screen.queryByTestId("dropdown");
  expect(visibleDropdown).toBeInTheDocument();
});

test("tests dropdown results on fetch", async () => {
  render(<GithubListing />);

  const searchInput = (await screen.getByTestId(
    "search-input",
  )) as HTMLInputElement;
  fireEvent.focus(searchInput);

  const noResultsText = await screen.queryByTestId("no-results");
  expect(noResultsText).toBeInTheDocument();

  fireEvent.change(searchInput, { target: { value: "Makers Den" } });
  expect(searchInput.value).toBe("Makers Den");

  await waitFor(() =>
    expect(screen.getByTestId("spinner")).toBeInTheDocument(),
  );

  await waitFor(() => {
    expect(screen.getAllByTestId("search-entry").length).toBeGreaterThan(0);
  });
});

test("tests entry highlighting using arrow keys", async () => {
  render(<GithubListing />);

  const searchInput = (await screen.getByTestId(
    "search-input",
  )) as HTMLInputElement;

  fireEvent.focus(searchInput);

  fireEvent.change(searchInput, { target: { value: "Makers Den" } });
  expect(searchInput.value).toBe("Makers Den");

  await waitFor(() => {
    expect(screen.getAllByTestId("search-entry").length).toBeGreaterThan(0);
  });

  let highlightedSearchEntries = await screen.queryAllByTestId(
    "search-entry-focused",
  );
  expect(highlightedSearchEntries.length).toBe(0);

  fireEvent.keyDown(document, { key: "ArrowDown" });
  await waitFor(() =>
    expect(screen.getAllByTestId("search-entry-focused").length).toBe(1),
  );

  highlightedSearchEntries = await screen.queryAllByTestId(
    "search-entry-focused",
  );
  expect(highlightedSearchEntries.length).toBe(1);
  expect(searchInput.scrollIntoView).toHaveBeenCalledTimes(1);
});
