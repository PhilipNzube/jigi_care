import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-gifted-charts";
import { Colors, Sizes } from "../../../shared/constants";
import { getBloodPressureTrends } from "../services/healthMonitoringService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

const BloodPressureChart = forwardRef((props, ref) => {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.max(400, screenWidth - 40); // Minimum 400px or screen width minus padding
  const [trendsData, setTrendsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBloodPressureTrends = async () => {
    try {
      setIsLoading(true);
      const data = await getBloodPressureTrends();
      setTrendsData(data);
    } catch (error) {
      console.error("❌ [BLOOD PRESSURE CHART] Error fetching trends:", error);
      setTrendsData({ readings: [], period: "last_7_days" });
    } finally {
      setIsLoading(false);
    }
  };

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchBloodPressureTrends,
  }));

  useEffect(() => {
    fetchBloodPressureTrends();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBloodPressureTrends();
    }, [])
  );

  // Transform API data to chart format
  const bloodPressureData =
    trendsData?.readings?.map((reading) => ({
      value: reading.systolic,
      dataPointText: reading.systolic.toString(),
    })) || [];

  const diastolicData =
    trendsData?.readings?.map((reading) => ({
      value: reading.diastolic,
      dataPointText: reading.diastolic.toString(),
    })) || [];

  // Calculate min/max for chart
  const allValues = [
    ...bloodPressureData.map((d) => d.value),
    ...diastolicData.map((d) => d.value),
  ];
  const maxValue = allValues.length > 0 ? Math.max(...allValues) + 20 : 140;
  const minValue =
    allValues.length > 0 ? Math.max(0, Math.min(...allValues) - 20) : 70;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.chartTitle}>Blood Pressure</Text>
        <View style={styles.chartCard}>
          <ShimmerLoader>
            <View style={styles.shimmerChartContainer}>
              <View style={styles.shimmerChartArea} />
              <View style={styles.shimmerLegendContainer}>
                <View style={styles.shimmerLegendItem} />
                <View style={styles.shimmerLegendItem} />
              </View>
              <View style={styles.shimmerTimeframe} />
            </View>
          </ShimmerLoader>
        </View>
      </View>
    );
  }

  if (bloodPressureData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.chartTitle}>Blood Pressure</Text>
        <View style={styles.chartCard}>
          <Text style={styles.emptyText}>
            No blood pressure readings available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Blood Pressure</Text>
      <View style={styles.chartCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContainer}
        >
          <LineChart
            data={bloodPressureData}
            data2={diastolicData}
            height={200}
            width={chartWidth}
            color="#4DD0E1"
            color2="#EC407A"
            thickness={2}
            thickness2={2}
            dataPointsColor="#4DD0E1"
            dataPointsColor2="#EC407A"
            dataPointsRadius={4}
            dataPointsRadius2={4}
            areaChart
            areaChart1
            areaChart2
            startFillColor="#E0F7FA"
            startFillColor2="#FCE4EC"
            endFillColor="#E0F7FA"
            endFillColor2="#FCE4EC"
            startOpacity={0.3}
            startOpacity2={0.3}
            endOpacity={0.1}
            endOpacity2={0.1}
            hideDataPoints={false}
            hideDataPoints2={false}
            hideRules={false}
            hideYAxisText={false}
            hideAxesAndRules={false}
            rulesType="solid"
            rulesColor="#E0E0E0"
            rulesThickness={1}
            yAxisColor="#E0E0E0"
            xAxisColor="#E0E0E0"
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisTextStyle={{
              color: Colors.textSecondary,
              fontSize: 12,
              fontFamily: "Poppins-Regular",
            }}
            xAxisTextStyle={{
              color: Colors.textSecondary,
              fontSize: 12,
              fontFamily: "Poppins-Regular",
            }}
            yAxisLabelWidth={30}
            xAxisLabelHeight={30}
            showVerticalLines={false}
            showHorizontalLines={true}
            horizontalLinesColor="#E0E0E0"
            horizontalLinesThickness={1}
            noOfSections={7}
            maxValue={maxValue}
            minValue={minValue}
            stepValue={10}
            stepHeight={20}
            spacing={40}
            initialSpacing={20}
            endSpacing={20}
            curved={true}
            curved2={true}
            animationDuration={1000}
            animateOnDataChange={true}
            showStripOnHover={true}
            stripColor="#4DD0E1"
            stripWidth={2}
            stripHeight={40}
            stripOpacity={0.3}
            showStripOnHover2={true}
            stripColor2="#EC407A"
            stripWidth2={2}
            stripHeight2={40}
            stripOpacity2={0.3}
          />
        </ScrollView>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#4DD0E1" }]}
            />
            <Text style={styles.legendText}>Systolic</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#EC407A" }]}
            />
            <Text style={styles.legendText}>Diastolic</Text>
          </View>
        </View>
        <Text style={styles.chartTimeframe}>
          {trendsData?.period === "last_7_days"
            ? "Last 7 days"
            : trendsData?.period || "Last 7 days"}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  chartScrollContainer: {
    alignItems: "center",
    paddingHorizontal: Sizes.sm,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Sizes.md,
    marginBottom: Sizes.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Sizes.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Sizes.xs,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  chartTimeframe: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    paddingVertical: Sizes.xl,
  },
  shimmerChartContainer: {
    width: "100%",
    alignItems: "center",
  },
  shimmerChartArea: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: Sizes.md,
  },
  shimmerLegendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Sizes.sm,
    gap: Sizes.md,
  },
  shimmerLegendItem: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  shimmerTimeframe: {
    width: 100,
    height: 14,
    borderRadius: 4,
    alignSelf: "center",
  },
});

BloodPressureChart.displayName = "BloodPressureChart";

export default BloodPressureChart;
