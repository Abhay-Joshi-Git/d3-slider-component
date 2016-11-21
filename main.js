var app = angular.module('app', []);

app.controller('mainController', ['$scope', function($scope) {
  $scope.value1 = 30;
  $scope.value2 = 30;
  $scope.value3 = 22;
  $scope.value4 = 18;

  $scope.minValue1 = 25;
  $scope.minValue2 = 15;
  $scope.minValue3 = 2;
  $scope.minValue4 = 1;

  $scope.containerStyleOptions = {
    height: '40px',
    width: '150px',
    margin: '10px 0'
  };

  $scope.secondValueWidth = '150px';

  $scope.$watch('secondValueWidth', function(newVal, oldVal){
    $scope.containerStyleOptions = {
      height: '20px',
      width: newVal,
      margin: '10px 0'
    };
  });

  $scope.verticalLinesOption = {
    verticalLinesColor: '#7f7f7f'
  };

  $scope.changeVerticalLinesColor = function() {
    $scope.verticalLinesOption = {
      verticalLinesColor: 'red'
    };
  };

  //$scope.$watch('value1', function(newVal){
  //  $scope.value2 = newVal - 4;
  //  $scope.value3 = newVal - 8;
  //  $scope.value4 = newVal - 12;
  //});

  $scope.minValue = 10;
  $scope.maxValue = 35;
  $scope.valueChangeHandler = function(newValue) {
    console.log('value is changed, new value : ' + newValue, $scope.value1, $scope.value2, $scope.value3, $scope.value4);
  }

}]);





