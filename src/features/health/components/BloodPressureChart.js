import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Colors, Sizes } from "../../../shared/constants";

const BloodPressureChart = () => {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.max(400, screenWidth - 40); // Minimum 400px or screen width minus padding

  // Sample blood pressure data for the last 7 days
  const bloodPressureData = [
    { value: 120, dataPointText: "120" },
    { value: 125, dataPointText: "125" },
    { value: 118, dataPointText: "118" },
    { value: 130, dataPointText: "130" },
    { value: 122, dataPointText: "122" },
    { value: 128, dataPointText: "128" },
    { value: 120, dataPointText: "120" },
  ];

  const diastolicData = [
    { value: 80, dataPointText: "80" },
    { value: 82, dataPointText: "82" },
    { value: 78, dataPointText: "78" },
    { value: 85, dataPointText: "85" },
    { value: 79, dataPointText: "79" },
    { value: 83, dataPointText: "83" },
    { value: 80, dataPointText: "80" },
  ];

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
            maxValue={140}
            minValue={70}
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
        <Text style={styles.chartTimeframe}>Last 7 days</Text>
      </View>
    </View>
  );
};

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
});

export default BloodPressureChart;
