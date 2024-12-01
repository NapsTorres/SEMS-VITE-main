/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button, Pagination, Select, Spin } from "antd";
import useGameScorig from "./useGameScoring";

const { Option } = Select;

export const GameScoring = () => {
  const { Match, isFetchingMatch } = useGameScorig({});
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage] = useState(6);

  // State for filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");

  // Helper function for status background and text color
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bgColor: "bg-yellow-200", // Background color for pending status
          textColor: "text-yellow-700", // Text color for pending status
        };
      case "ongoing":
        return {
          bgColor: "bg-orange-300", // Background color for ongoing status
          textColor: "text-orange-700", // Text color for ongoing status
        };
      case "completed":
        return {
          bgColor: "bg-green-300", // Background color for completed status
          textColor: "text-green-700", // Text color for completed status
        };
      default:
        return {
          bgColor: "bg-gray-200", // Background color for default status
          textColor: "text-gray-700", // Text color for default status
        };
    }
  };

  // Filter matches based on selected criteria
  const filteredMatches = Match?.filter((match: any) => {
    const hasSched = match.schedule !== "" && match.schedule !== null;
    const statusMatches = statusFilter === "all" || match.status === statusFilter;
    const roundMatches = roundFilter === "all" || match.round.toString() === roundFilter;
    const eventMatches = eventFilter === "all" || match.event.eventName === eventFilter;
    const sportMatches = sportFilter === "all" || match.sport.sportsName === sportFilter;

    return statusMatches && roundMatches && eventMatches && sportMatches && hasSched;
  });

  // Extract unique Event Names and Sport Names
  const uniqueEvents = [
    ...new Map(
      Match?.map((match: any) => [match.event.eventId, match.event.eventName])
    ).values(),
  ];
  const uniqueSports = [
    ...new Map(
      Match?.map((match: any) => [match.sport.sportsId, match.sport.sportsName])
    ).values(),
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isFetchingMatch) {
    return <Spin size="large" />;
  }

  // Function to determine the winner
  const getWinner = (team1Score: number, team2Score: number, team1: any, team2: any, status: string) => {
    if (team1Score > team2Score) return team1?.teamName || "Team 1";
    if (team2Score > team1Score) return team2?.teamName || "Team 2";

    // If scores are equal, check the match status
    if (team1Score === team2Score) {
      if (status === "completed") {
        return "Draw"; // Draw if the status is 'completed'
      } else {
        return "Not Declared"; // Not declared if the match is not completed
      }
    }

    return "Not Declared"; // Default case if no condition matches
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Game Scoring</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 200 }}
          placeholder="Filter by Status"
        >
          <Option value="all">All Statuses</Option>
          <Option value="pending">Pending</Option>
          <Option value="ongoing">Ongoing</Option>
          <Option value="completed">Completed</Option>
        </Select>

        {/* Round Filter */}
        <Select
          value={roundFilter}
          onChange={(value) => setRoundFilter(value)}
          style={{ width: 200 }}
          placeholder="Filter by Round"
        >
          <Option value="all">All Rounds</Option>
          {[...new Set(Match?.map((m: any) => m.round))].map((round) => (
            <Option key={round} value={round.toString()}>
              Round {round}
            </Option>
          ))}
        </Select>

        {/* Event Filter */}
        <Select
          value={eventFilter}
          onChange={(value) => setEventFilter(value)}
          style={{ width: 200 }}
          placeholder="Filter by Event"
        >
          <Option value="all">All Events</Option>
          {uniqueEvents.map((eventName) => (
            <Option key={eventName} value={eventName}>
              {eventName}
            </Option>
          ))}
        </Select>

        {/* Sport Filter */}
        <Select
          value={sportFilter}
          onChange={(value) => setSportFilter(value)}
          style={{ width: 200 }}
          placeholder="Filter by Sport"
        >
          <Option value="all">All Sports</Option>
          {uniqueSports.map((sportName) => (
            <Option key={sportName} value={sportName}>
              {sportName}
            </Option>
          ))}
        </Select>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {filteredMatches?.map((match: any) => {
          const team1 = match.team1;
          const team2 = match.team2;
          const team1Score = match.team1Score || 0;
          const team2Score = match.team2Score || 0;
          const winner = getWinner(team1Score, team2Score, team1, team2, match.status); // Pass match.status here
          const eventAndSport = `${match.event?.eventName || "Unknown Event"} - ${match.sport?.sportsName || "Unknown Sport"}`;
          const { textColor } = getStatusStyles(match.status);

          return (
            <div
              key={match.matchId}
              className={`bg-white p-4 rounded-lg grid h-[400px] grid-rows-6 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] border-2 border-black`}
            >
              <h2 className="text-lg row-span-1 font-semibold text-center text-blue-700 mb-2">
                {eventAndSport}
              </h2>
              <h2 className="text-lg row-span-1 font-semibold text-center mb-4">
                Round {match.round} - Match {match.matchId}
              </h2>
              <div className="text-center row-span-1 mb-4">
                <p className="text-xl font-bold">
                  <strong>Winner:</strong> {winner}
                </p>
              </div>
              <div className="flex row-span-3 justify-center items-center mb-4">
                <div className="flex flex-col items-center mx-4">
                  <img
                    src={team1?.teamLogo || "https://via.placeholder.com/60"}
                    alt={team1?.teamName}
                    className="w-16 h-16 rounded-full shadow-md"
                  />
                  <p className="font-semibold text-center mt-2">{team1?.teamName || "Team 1"}</p>
                  <p className="text-lg">{team1Score}</p>
                </div>
                <p className="text-xl font-bold mx-2">VS</p>
                <div className="flex flex-col items-center mx-4">
                  <img
                    src={team2?.teamLogo || "https://via.placeholder.com/60"}
                    alt={team2?.teamName}
                    className="w-16 h-16 rounded-full shadow-md"
                  />
                  <p className="font-semibold text-center mt-2">{team2?.teamName || "Team 2"}</p>
                  <p className="text-lg">{team2Score}</p>
                </div>
              </div>
              <div className="row-span-1 text-center mb-4">
                <p className={`${textColor} p-1 rounded-lg inline-block`}>
                  <strong>Status:</strong> {match.status || "Pending"}
                </p>
                <p>
                  <strong>Scheduled:</strong> {new Date(match.schedule).toLocaleString()}
                </p>
              </div>
              <Link className="row-span-1" to={`match/${match.matchId}`}>
                <Button type="primary" block>
                  View Details
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        current={currentPage}
        pageSize={matchesPerPage}
        total={filteredMatches?.length || 0}
        onChange={handlePageChange}
        showSizeChanger={false}
      />
    </div>
  );
};
