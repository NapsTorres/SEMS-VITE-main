/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { DatePicker, Select, Button, Form } from "antd";
import moment from "moment";
import { Team } from "../../types";
import useSportEventHooks from "../../pages/private/events/useSportEventHooks";

const { Option } = Select;

interface Match {
  id: number;
  team1Id: number | null;
  team2Id: number | null;
  date: moment.Moment | null;
}

const AdminMatchForm = ({
  teams,
  sportDetails,
}: {
  teams: Team[];
  sportDetails: any;
}) => {
  const { isLoading, handleGenerateMatchup } = useSportEventHooks({
    sportDetails,
  });

  const [matches, setMatches] = useState<Match[]>([]);

  // Dynamically create match slots based on selected teams
  useEffect(() => {
    const numberOfMatches = Math.floor(teams.length / 2); // Every 2 teams create 1 match
    const generatedMatches: Match[] = [];

    // Create matches for pairs of teams
    for (let i = 0; i < numberOfMatches; i++) {
      generatedMatches.push({
        id: i + 1,
        team1Id: null,
        team2Id: null,
        date: null,
      });
    }

    // If there's an odd number of teams, create a match with a "free" team
    if (teams.length % 2 !== 0) {
      generatedMatches.push({
        id: numberOfMatches + 1,
        team1Id: null,
        team2Id: null, // No opponent for this match, it’s an auto-win for one team
        date: null,
      });
    }

    setMatches(generatedMatches);
  }, [teams]);

  // Flatten selected team IDs from all matches
  const selectedTeamIds = matches.reduce<number[]>((acc, match) => {
    if (match.team1Id) acc.push(match.team1Id);
    if (match.team2Id) acc.push(match.team2Id);
    return acc;
  }, []);

  const handleTeamChange = (
    matchId: number,
    teamKey: "team1Id" | "team2Id",
    value: number
  ) => {
    setMatches((prevMatches) =>
      prevMatches.map((match) =>
        match.id === matchId ? { ...match, [teamKey]: value } : match
      )
    );
  };

  const handleDateChange = (matchId: number, date: moment.Moment | null) => {
    setMatches((prevMatches) =>
      prevMatches.map((match) =>
        match.id === matchId ? { ...match, date } : match
      )
    );
  };

  return (
    <div className="p-6 rounded-lg">
      <Form layout="vertical">
        {matches.map((match) => (
          <div key={match.id} className="grid grid-cols-3 gap-4 mb-4">
            <Form.Item label={`Match ${match.id} - Team 1`}>
              <Select
                placeholder="Select Team 1"
                value={match.team1Id || undefined}
                onChange={(value) =>
                  handleTeamChange(match.id, "team1Id", value)
                }
              >
                {teams
                  .filter(
                    (team) =>
                      team.teamId !== match.team2Id &&
                      (!selectedTeamIds.includes(team.teamId) ||
                        team.teamId === match.team1Id)
                  )
                  .map((team) => (
                    <Option key={team.teamId} value={team.teamId}>
                      {team.teamName}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label={`Match ${match.id} - Team 2`}>
              <Select
                placeholder="Select Team 2"
                value={match.team2Id || undefined}
                onChange={(value) =>
                  handleTeamChange(match.id, "team2Id", value)
                }
              >
                {teams
                  .filter(
                    (team) =>
                      team.teamId !== match.team1Id &&
                      (!selectedTeamIds.includes(team.teamId) ||
                        team.teamId === match.team2Id)
                  )
                  .map((team) => (
                    <Option key={team.teamId} value={team.teamId}>
                      {team.teamName}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label="Date">
              <DatePicker
                showTime={{ use12Hours: true, format: "hh:mm A" }}
                format="DD/MM/YYYY hh:mm A"
                value={match.date}
                onChange={(date) => handleDateChange(match.id, date)}
                placeholder="dd/mm/yyyy --:-- AM/PM"
                className="w-full"
              />
            </Form.Item>
          </div>
        ))}

        <div className="flex justify-end w-full gap-4">
          <Button type="default">Cancel</Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={() => handleGenerateMatchup(matches)}
          >
            Generate Matches
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AdminMatchForm;
