import {
  Card,
  Metric,
  Text,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react";
import { useState, useEffect, useCallback, useMemo } from "react";

import PricePerCommute from "./PricePerCommute";
import AmenitiesTable from "./AmenitiesTable";
import UserRankings from "./UserRankings";
import MapView from "./MapView";
import InviteCode from "./InviteCode";
import { supabase } from "../lib/supabase";
import { addUserRatings, computeScores, computeStats } from "../lib/helpers";
import AddApartment from "./AddApartment";
import ApartmentList from "./ApartmentList";
import { useAuth } from "../hooks/useAuth";
import { SignOutButton } from "./auth/SignOutButton";
import NeighborhoodTable from "./NeighborhoodTable";
import DecisionMatrix from "./DecisionMatrix";
import HeadToHead from "./HeadToHead";

export function Dashboard() {
  const { profile } = useAuth();
  const [rawApartments, setRawApartments] = useState([]);
  const [apartmentsWithRatings, setApartmentsWithRatings] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchApartments = useCallback(async () => {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .eq("group_id", profile.group_id)
      .order("created_at", { ascending: true });

    if (!error) {
      const withScores = computeScores(data);
      const withRatings = await addUserRatings(withScores);
      setRawApartments(data);
      setApartmentsWithRatings(withRatings);
    }
  }, [profile.group_id]);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("group_id", profile.group_id);

    if (!error) {
      setUsers(data);
    }
  }, [profile.group_id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const apartmentsWithScores = useMemo(() => {
    if (!rawApartments.length) {
      return [];
    }

    return computeScores(rawApartments);
  }, [rawApartments]);

  const stats = rawApartments.length
    ? computeStats(rawApartments)
    : { count: 0, minPrice: 0, maxPrice: 0, minCommute: 0, maxCommute: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Apartment Search
            </h1>
            <InviteCode />
          </div>

          <SignOutButton />
        </div>

        {/* Stat cards */}
        <Grid numItemsSm={3} className="gap-3 mb-6">
          <Card>
            <Text>Apartments Tracked</Text>
            <Metric>{stats.count}</Metric>
          </Card>
          <Card>
            <Text>1bd Price Range</Text>
            <Metric className="truncate">
              ${stats.minPrice.toLocaleString()} – $
              {stats.maxPrice.toLocaleString()}
            </Metric>
          </Card>
          <Card>
            <Text>Commute Range</Text>
            <Metric>
              {stats.minCommute} – {stats.maxCommute} min
            </Metric>
          </Card>
        </Grid>

        <AddApartment onSave={fetchApartments} />

        {/* Tabs */}
        <TabGroup>
          <div className="overflow-x-auto -mx-4 px-4">
            <TabList className="mb-4 mt-4 w-max min-w-full">
              <Tab>Map</Tab>
              <Tab>Neighborhoods</Tab>
              <Tab>List</Tab>
              <Tab>Ratings</Tab>
              <Tab>Commute & Value</Tab>
              <Tab>Amenities</Tab>
              <Tab>Decision Matrix</Tab>
              <Tab>Compare</Tab>
            </TabList>
          </div>

          <TabPanels>
            <TabPanel>
              <MapView apartmentsWithScores={apartmentsWithScores} />
            </TabPanel>

            <TabPanel>
              <div className="space-y-6">
                <NeighborhoodTable
                  apartmentsWithScores={apartmentsWithScores}
                />
              </div>
            </TabPanel>

            <TabPanel>
              <ApartmentList
                apartments={apartmentsWithRatings}
                onSave={fetchApartments}
                users={users}
              />
            </TabPanel>

            <TabPanel>
              <UserRankings apartments={apartmentsWithRatings} users={users} />
            </TabPanel>

            <TabPanel>
              <div className="space-y-6">
                <PricePerCommute apartmentsWithScores={apartmentsWithScores} />
              </div>
            </TabPanel>

            <TabPanel>
              <AmenitiesTable apartmentsWithScores={apartmentsWithScores} />
            </TabPanel>

            <TabPanel>
              <DecisionMatrix apartmentsWithRatings={apartmentsWithRatings} />
            </TabPanel>

            <TabPanel>
              <HeadToHead
                apartmentsWithRatings={apartmentsWithRatings}
                profile={profile}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
