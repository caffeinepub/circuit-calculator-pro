import Float "mo:core/Float";
import Order "mo:core/Order";
import Text "mo:core/Text";

actor {
  type CalculationResult = {
    value : Float;
    steps : [Text];
  };

  type CalculationResponse = {
    #ok : CalculationResult;
    #err : Text;
  };

  func compareCalculationResult(result1 : CalculationResult, result2 : CalculationResult) : Order.Order {
    Float.compare(result1.value, result2.value);
  };

  type CalculationStep = {
    input1 : Float;
    input2 : Float;
    calculatedValue : Float;
    steps : [Text];
  };

  func compareCalculationStep(step1 : CalculationStep, step2 : CalculationStep) : Order.Order {
    Float.compare(step1.calculatedValue, step2.calculatedValue);
  };

  public shared ({ caller }) func ohmsLaw(voltage : ?Float, current : ?Float, resistance : ?Float) : async CalculationResponse {
    let voltCount = if (voltage != null) { 1 } else { 0 };
    let currCount = if (current != null) { 1 } else { 0 };
    let resCount = if (resistance != null) { 1 } else { 0 };

    if (voltCount + currCount + resCount != 2) {
      return #err("Exactly two values must be provided to calculate the third using Ohm's Law");
    };

    switch (voltage, current, resistance) {
      case (null, ?i, ?r) {
        if (i == 0 or r == 0) { return #err("Voltage calculation resulted in 0 V. Please provide valid values for current and resistance.") };
        #ok({
          value = i * r;
          steps = [
            "V = I * R",
            "V = " # i.toText() # " * " # r.toText(),
          ];
        });
      };
      case (?v, null, ?r) {
        if (r == 0) { return #err("Resistance cannot be zero") };
        #ok({
          value = v / r;
          steps = [
            "I = V / R",
            "I = " # v.toText() # " / " # r.toText(),
          ];
        });
      };
      case (?v, ?i, null) {
        if (i == 0) { return #err("Current cannot be zero") };
        #ok({
          value = v / i;
          steps = [
            "R = V / I",
            "R = " # v.toText() # " / " # i.toText(),
          ];
        });
      };
      case (_, _, _) {
        #err("Invalid combination of inputs for Ohm's Law calculation");
      };
    };
  };

  public shared ({ caller }) func voltageDivider(vin : Float, r1 : Float, r2 : Float) : async CalculationResponse {
    if (r1 < 0 or r2 < 0) { return #err("Resistance values must be non-negative") };
    if (r1 + r2 == 0) { return #err("Sum of R1 and R2 cannot be zero") };

    #ok({
      value = vin * r2 / (r1 + r2);
      steps = [
        "Vout = Vin * R2 / (R1 + R2)",
        "Vout = " # vin.toText() # " * " # r2.toText() # " / (" # r1.toText() # " + " # r2.toText() # ")",
      ];
    });
  };

  public shared ({ caller }) func rcTimeConstant(r : Float, c : Float) : async CalculationResponse {
    if (r < 0 or c < 0) { return #err("Resistance and capacitance values must be non-negative") };

    #ok({
      value = r * c;
      steps = [
        "Time constant = R * C",
        "Time constant = " # r.toText() # " * " # c.toText(),
      ];
    });
  };

  public shared ({ caller }) func rlcResonantFrequency(l : Float, c : Float) : async CalculationResponse {
    if (l <= 0 or c <= 0) { return #err("Inductance and capacitance must be positive") };
    let frequency = 1 / (2 * 3.14159265359 * Float.sqrt(l * c));
    #ok({
      value = frequency;
      steps = [
        "Frequency = 1 / (2 * pi * sqrt(L * C))",
        "Frequency = 1 / (2 * " # 3.14159265359.toText() # " * sqrt(" # l.toText() # " * " # c.toText() # "))",
      ];
    });
  };
};
