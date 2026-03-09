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
import PriceChart from "./components/PriceChart";
import ByAreaChart from "./components/ByAreaChart";
import CommuteScatter from "./components/CommuteScatter";
import ValueScoreChart from "./components/ValueScoreChart";
import AmenitiesTable from "./components/AmenitiesTable";
import RankingChart from "./components/RankingChart";
import UserRankings from "./components/UserRankings";
import MapView from "./components/MapView";
import BedFilter from "./components/BedFilter";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "./lib/supabase";
import { addUserRatings, computeScores, computeStats } from "./lib/helpers";
import AddApartment from "./components/AddApartment";
import ApartmentList from "./components/ApartmentLIst";
import { TourPlan } from "./components/TourPlan";

export default function App() {
  const [bedFilter, setBedFilter] = useState("1bd");
  const [rawApartments, setRawApartments] = useState([]);
  const [apartmentsWithRatings, setApartmentsWithRatings] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchApartments = useCallback(async () => {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error) {
      setRawApartments(data);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from("users").select("*");

    if (!error) {
      setUsers(data);
    }
  }, []);

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

  useEffect(() => {
    if (!apartmentsWithScores.length) {
      return;
    }
    addUserRatings(apartmentsWithScores).then(setApartmentsWithRatings);
  }, [apartmentsWithScores]);

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
            <p className="text-gray-500 mt-1 text-sm">
              Orlando Area · {new Date().getFullYear()}
            </p>
          </div>
          <AddApartment onSave={fetchApartments} />
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

        <BedFilter bedFilter={bedFilter} setBedFilter={setBedFilter} />

        {/* Tabs */}
        <TabGroup>
          <div className="overflow-x-auto -mx-4 px-4">
            <TabList className="mb-4 mt-4 w-max min-w-full">
              <Tab>Map</Tab>
              <Tab>Prices</Tab>
              <Tab>List</Tab>
              <Tab>Ratings</Tab>
              <Tab>Commute & Value</Tab>
              <Tab>Amenities</Tab>
              <Tab>Scores</Tab>
              <Tab>Tour Plan</Tab>
            </TabList>
          </div>

          <TabPanels>
            <TabPanel>
              <MapView apartmentsWithScores={apartmentsWithScores} />
            </TabPanel>

            <TabPanel>
              <div className="space-y-6">
                <PriceChart
                  bedFilter={bedFilter}
                  apartmentsWithScores={apartmentsWithScores}
                />
                <ByAreaChart
                  bedFilter={bedFilter}
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
                <CommuteScatter apartmentsWithScores={apartmentsWithScores} />
                <ValueScoreChart apartmentsWithScores={apartmentsWithScores} />
              </div>
            </TabPanel>

            <TabPanel>
              <AmenitiesTable apartmentsWithScores={apartmentsWithScores} />
            </TabPanel>

            <TabPanel>
              <RankingChart apartmentsWithScores={apartmentsWithScores} />
            </TabPanel>

            <TabPanel>
              <TourPlan apartmentsWithScores={apartmentsWithScores} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
